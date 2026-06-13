// 連続7日間スライディングウィンドウ判定（複数勤務先合算・純関数）。P3。
import type { Shift, ValidationResult } from '@/lib/types';
import { VALIDATION_CODES } from '@/lib/constants/validationCodes';
import { uiStateFor } from '@/lib/constants/uiStateMap';
import {
  DEFAULT_WEEKLY_CAP,
  LONG_VACATION_WEEKLY_CAP,
  LONG_VACATION_DAILY_CAP,
} from '@/lib/constants/residenceStatus';

export interface HoursWindowResult extends ValidationResult {
  /** 検出された最大の合算時間（通常期=連続7日合計 / 長期休業=1日合計） */
  peakHours: number;
  /** 超過が起きた窓（連続7日）の開始日 or 超過日 */
  at?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  return new Date(d.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** 日付ごとに全勤務先の時間を合算した Map を返す。 */
export function aggregateDaily(shifts: Shift[]): Map<string, number> {
  const daily = new Map<string, number>();
  for (const s of shifts) {
    daily.set(s.date, (daily.get(s.date) ?? 0) + s.hours);
  }
  return daily;
}

function ok(peakHours: number): HoursWindowResult {
  const ui = uiStateFor(VALIDATION_CODES.OK);
  return { ok: true, severity: 'OK', code: VALIDATION_CODES.OK, reasonJa: ui.labelJa, peakHours };
}

function exceeded(peakHours: number, at: string, reasonJa: string): HoursWindowResult {
  return {
    ok: false,
    severity: 'NG',
    code: VALIDATION_CODES.HOURS_EXCEEDED,
    reasonJa,
    peakHours,
    at,
  };
}

/**
 * 複数勤務先のシフトを合算し、連続7日（カレンダー週ではなく任意の連続7日）で
 * 上限超過を検出する。
 *
 * - 通常期: 全ての連続7日窓の合計が 28h を超えたら NG。
 * - 留学＋長期休業中: 1日 8h 超で NG（任意で週40h上限も判定）。
 */
export function checkHoursWindow(
  shifts: Shift[],
  opts: { inLongVacation: boolean; isStudent: boolean },
): HoursWindowResult {
  const daily = aggregateDaily(shifts);
  if (daily.size === 0) return ok(0);

  const dates = [...daily.keys()].sort();

  // 留学＋長期休業中: 1日8h判定（+ 週40hの窓判定）
  if (opts.isStudent && opts.inLongVacation) {
    // 各日 8h 超
    let peakDay = 0;
    let peakDayAt = dates[0];
    for (const d of dates) {
      const h = daily.get(d)!;
      if (h > peakDay) {
        peakDay = h;
        peakDayAt = d;
      }
    }
    if (peakDay > LONG_VACATION_DAILY_CAP) {
      return exceeded(peakDay, peakDayAt, `長期休業中でも1日${LONG_VACATION_DAILY_CAP}時間が上限（${peakDayAt}: ${peakDay}h）`);
    }
    // 週40h（連続7日）も超過させない
    const win = peakWindow(daily, dates);
    if (win.sum > LONG_VACATION_WEEKLY_CAP) {
      return exceeded(win.sum, win.start, `長期休業中の連続7日合計が${LONG_VACATION_WEEKLY_CAP}時間を超過（${win.start}起点: ${win.sum}h）`);
    }
    return ok(Math.max(peakDay, win.sum));
  }

  // 通常期: 連続7日合計 > 28 で NG
  const win = peakWindow(daily, dates);
  if (win.sum > DEFAULT_WEEKLY_CAP) {
    return exceeded(win.sum, win.start, `連続する7日間の合計が${DEFAULT_WEEKLY_CAP}時間を超過（${win.start}起点: ${win.sum}h）`);
  }
  return ok(win.sum);
}

/** 各シフト日を起点とする連続7日窓の合計の最大値を返す。 */
function peakWindow(
  daily: Map<string, number>,
  dates: string[],
): { sum: number; start: string } {
  let best = { sum: 0, start: dates[0] };
  for (const start of dates) {
    const end = addDays(start, 6);
    let sum = 0;
    for (const d of dates) {
      if (d >= start && d <= end) sum += daily.get(d)!;
    }
    if (sum > best.sum) best = { sum, start };
  }
  return best;
}

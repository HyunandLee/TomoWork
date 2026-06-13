import { describe, it, expect } from 'vitest';
import { checkHoursWindow, aggregateDaily } from '@/lib/rules/hoursWindow';
import type { Shift } from '@/lib/types';

function makeShift(date: string, hours: number, employerId = 'emp-1'): Shift {
  return { date, hours, employerId };
}

describe('checkHoursWindow()', () => {
  const normalOpts = { inLongVacation: false, isStudent: true };
  const longVacOpts = { inLongVacation: true, isStudent: true };
  const familyOpts = { inLongVacation: false, isStudent: false };

  // ---- 通常期 ----
  it('通常期: 週28h以内 → OK', () => {
    const shifts = [
      makeShift('2026-06-01', 8),
      makeShift('2026-06-02', 8),
      makeShift('2026-06-03', 8),
      makeShift('2026-06-04', 4),
    ]; // 合計28h in 7日
    const result = checkHoursWindow(shifts, normalOpts);
    expect(result.ok).toBe(true);
  });

  it('通常期: 連続7日合計29h → HOURS_EXCEEDED', () => {
    const shifts = [
      makeShift('2026-06-01', 8),
      makeShift('2026-06-02', 8),
      makeShift('2026-06-03', 8),
      makeShift('2026-06-04', 5), // 29h
    ];
    const result = checkHoursWindow(shifts, normalOpts);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('HOURS_EXCEEDED');
  });

  it('通常期: カレンダー週OKだが連続7日でNG（ストラドル検出）', () => {
    // 月〜日でそれぞれ見ると28h以内でも、
    // 水〜翌火で見ると超過するケース
    const shifts = [
      makeShift('2026-06-03', 8), // 水
      makeShift('2026-06-04', 8), // 木
      makeShift('2026-06-05', 8), // 金
      makeShift('2026-06-07', 5), // 日 (月曜含む窓)
      makeShift('2026-06-08', 5), // 月 → 水〜火で29h
    ];
    // 2026-06-03 start: 06/03-06/09 → 8+8+8+5+5 = 34h > 28 → NG
    const result = checkHoursWindow(shifts, normalOpts);
    expect(result.ok).toBe(false);
  });

  it('通常期: 複数勤務先合算で超過 → HOURS_EXCEEDED', () => {
    const shifts = [
      makeShift('2026-06-01', 15, 'emp-1'),
      makeShift('2026-06-01', 15, 'emp-2'), // 同日で合算→30h
    ];
    const result = checkHoursWindow(shifts, normalOpts);
    expect(result.ok).toBe(false);
  });

  // ---- 長期休業中（留学） ----
  it('長期休業: 1日8h以内 → OK', () => {
    const shifts = [
      makeShift('2026-07-01', 8),
      makeShift('2026-07-02', 8),
      makeShift('2026-07-03', 8),
    ]; // 各日8h
    const result = checkHoursWindow(shifts, longVacOpts);
    expect(result.ok).toBe(true);
  });

  it('長期休業: 1日9h → HOURS_EXCEEDED', () => {
    const shifts = [makeShift('2026-07-01', 9)];
    const result = checkHoursWindow(shifts, longVacOpts);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('HOURS_EXCEEDED');
  });

  it('長期休業: 1日8h×5日=40h → OK（週上限境界）', () => {
    const shifts = [
      makeShift('2026-07-01', 8),
      makeShift('2026-07-02', 8),
      makeShift('2026-07-03', 8),
      makeShift('2026-07-04', 8),
      makeShift('2026-07-05', 8), // 40h
    ];
    const result = checkHoursWindow(shifts, longVacOpts);
    expect(result.ok).toBe(true);
  });

  it('長期休業: 1日8h×6日=48h → HOURS_EXCEEDED（週40h超過）', () => {
    const shifts = [
      makeShift('2026-07-01', 8),
      makeShift('2026-07-02', 8),
      makeShift('2026-07-03', 8),
      makeShift('2026-07-04', 8),
      makeShift('2026-07-05', 8),
      makeShift('2026-07-06', 8), // 48h > 40
    ];
    const result = checkHoursWindow(shifts, longVacOpts);
    expect(result.ok).toBe(false);
  });

  // ---- aggregateDaily ----
  it('aggregateDaily: 複数勤務先を日付でまとめる', () => {
    const shifts = [
      makeShift('2026-06-01', 5, 'emp-1'),
      makeShift('2026-06-01', 6, 'emp-2'),
      makeShift('2026-06-02', 4, 'emp-1'),
    ];
    const daily = aggregateDaily(shifts);
    expect(daily.get('2026-06-01')).toBe(11);
    expect(daily.get('2026-06-02')).toBe(4);
  });

  // ---- シフトなし ----
  it('シフトなし → OK (peakHours=0)', () => {
    const result = checkHoursWindow([], normalOpts);
    expect(result.ok).toBe(true);
    expect(result.peakHours).toBe(0);
  });
});

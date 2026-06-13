// 在留資格ごとの就労根拠・週上限の解決ロジック（純関数）。
import type { Worker, HireInput } from '@/lib/types';
import {
  RESIDENCE_RULES,
  LONG_VACATION_WEEKLY_CAP,
} from '@/lib/constants/residenceStatus';

/**
 * 当該雇用における実効的な週上限（時間）を返す。
 * - 留学 / 家族滞在: 28h（留学＋長期休業中は 40h）
 * - 特定活動: 指定書の weeklyCap（null = 無制限）
 */
export function effectiveWeeklyCap(
  worker: Worker,
  hire: Pick<HireInput, 'inLongVacation'>,
): number | null {
  const rule = RESIDENCE_RULES[worker.residenceStatus];

  if (rule.designationBased) {
    // 特定活動: 指定書次第
    return worker.designation?.weeklyCap ?? null;
  }

  // 留学 / 家族滞在
  if (rule.longVacationException && hire.inLongVacation) {
    return LONG_VACATION_WEEKLY_CAP;
  }
  return rule.weeklyCap; // 28
}

/** 当該資格が「資格外活動許可」を就労根拠とするか。 */
export function isPermitBased(worker: Worker): boolean {
  return RESIDENCE_RULES[worker.residenceStatus].permitBased;
}

/** 当該資格が「指定書」を就労根拠とするか（特定活動）。 */
export function isDesignationBased(worker: Worker): boolean {
  return RESIDENCE_RULES[worker.residenceStatus].designationBased;
}

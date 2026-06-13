// 就労コンプライアンス検証エンジン（アプリの心臓・純関数）。
import type { Worker, HireInput, ValidationResult } from '@/lib/types';
import { VALIDATION_CODES } from '@/lib/constants/validationCodes';
import { isProhibitedJob } from '@/lib/constants/prohibitedJobs';
import { uiStateFor } from '@/lib/constants/uiStateMap';
import {
  effectiveWeeklyCap,
  isDesignationBased,
} from './statusRules';

function result(code: string): ValidationResult {
  const ui = uiStateFor(code);
  return {
    ok: ui.severity === 'OK',
    severity: ui.severity,
    code,
    reasonJa: ui.labelJa,
  };
}

/**
 * worker と hire 入力からコンプライアンス検証を行う。
 * 判定順序（最初に該当を返す）:
 *   1. EXPIRED            : 在留期限 < 雇入れ日
 *   2. PROHIBITED_JOB     : 風俗営業等
 *   3. 在留資格で分岐
 *      - 留学 / 家族滞在  : 許可なし→NO_PERMIT / 週上限超過→HOURS_EXCEEDED
 *      - 特定活動         : 就労不可→DESIGNATION_NO_WORK / 週上限超過→HOURS_EXCEEDED
 *   4. OK
 */
export function validate(worker: Worker, hire: HireInput): ValidationResult {
  // 1. 在留期限切れ
  if (worker.residenceUntil < hire.hireDate) {
    return result(VALIDATION_CODES.EXPIRED);
  }

  // 2. 風俗営業等（許可があっても不可）
  if (isProhibitedJob(hire.jobCategory)) {
    return result(VALIDATION_CODES.PROHIBITED_JOB);
  }

  // 3. 在留資格で分岐
  if (isDesignationBased(worker)) {
    // 特定活動
    if (!worker.designation?.workAllowed) {
      return result(VALIDATION_CODES.DESIGNATION_NO_WORK);
    }
    const cap = effectiveWeeklyCap(worker, hire); // null = 無制限
    if (cap !== null && hire.weeklyHours > cap) {
      return result(VALIDATION_CODES.HOURS_EXCEEDED);
    }
  } else {
    // 留学 / 家族滞在
    if (!worker.hasActivityPermit) {
      return result(VALIDATION_CODES.NO_PERMIT);
    }
    const cap = effectiveWeeklyCap(worker, hire); // 28 or 40
    if (cap !== null && hire.weeklyHours > cap) {
      return result(VALIDATION_CODES.HOURS_EXCEEDED);
    }
  }

  // 4. OK
  return result(VALIDATION_CODES.OK);
}

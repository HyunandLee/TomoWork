// 在留カード番号の形式検証（純関数）。形式: 英字2 + 数字8 + 英字2。
import type { ValidationResult } from '@/lib/types';
import { VALIDATION_CODES } from '@/lib/constants/validationCodes';
import { uiStateFor } from '@/lib/constants/uiStateMap';

export const RESIDENCE_CARD_RE = /^[A-Z]{2}\d{8}[A-Z]{2}$/;

export function isValidCardNo(cardNo: string): boolean {
  return RESIDENCE_CARD_RE.test(cardNo);
}

export function checkCardFormat(cardNo: string): ValidationResult {
  if (isValidCardNo(cardNo)) {
    const ok = uiStateFor(VALIDATION_CODES.OK);
    return { ok: true, severity: 'OK', code: VALIDATION_CODES.OK, reasonJa: ok.labelJa };
  }
  const ng = uiStateFor(VALIDATION_CODES.CARD_FORMAT);
  return {
    ok: false,
    severity: 'NG',
    code: VALIDATION_CODES.CARD_FORMAT,
    reasonJa: ng.labelJa,
  };
}

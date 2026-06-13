// code → 表示メタ（severity / color / labelJa）。UI・テストはここを参照。
import { VALIDATION_CODES, type ValidationCode } from './validationCodes';
import type { Severity } from '@/lib/types';

export interface UiState {
  severity: Severity;
  /** Tailwind/CSS どちらでも使える意味色キー */
  color: 'green' | 'red';
  labelJa: string;
}

export const UI_STATE_MAP: Record<ValidationCode, UiState> = {
  [VALIDATION_CODES.OK]: {
    severity: 'OK',
    color: 'green',
    labelJa: '就労可能 — 提出できます',
  },
  [VALIDATION_CODES.EXPIRED]: {
    severity: 'NG',
    color: 'red',
    labelJa: '在留期限切れ — 就労不可',
  },
  [VALIDATION_CODES.PROHIBITED_JOB]: {
    severity: 'NG',
    color: 'red',
    labelJa: '風俗営業等 — 資格外活動許可があっても就労不可',
  },
  [VALIDATION_CODES.NO_PERMIT]: {
    severity: 'NG',
    color: 'red',
    labelJa: '資格外活動許可なし — 就労不可',
  },
  [VALIDATION_CODES.HOURS_EXCEEDED]: {
    severity: 'NG',
    color: 'red',
    labelJa: '週所定労働時間が上限超過',
  },
  [VALIDATION_CODES.DESIGNATION_NO_WORK]: {
    severity: 'NG',
    color: 'red',
    labelJa: '指定書上 就労不可',
  },
  [VALIDATION_CODES.CARD_FORMAT]: {
    severity: 'NG',
    color: 'red',
    labelJa: '在留カード番号の形式が不正',
  },
};

export function uiStateFor(code: string): UiState {
  return UI_STATE_MAP[code as ValidationCode] ?? UI_STATE_MAP[VALIDATION_CODES.OK];
}

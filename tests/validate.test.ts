import { describe, it, expect } from 'vitest';
import { validate } from '@/lib/rules/validate';
import type { Worker, HireInput } from '@/lib/types';

// テスト用ワーカーファクトリ
function makeWorker(overrides: Partial<Worker> = {}): Worker {
  return {
    id: 'w-test',
    nameRoman: 'TEST USER',
    nameKana: 'テスト ユーザー',
    birthDate: '2000-01-01',
    sex: '男',
    nationality: 'ベトナム',
    residenceStatus: '留学',
    residenceUntil: '2028-12-31',
    residenceCardNo: 'AB12345678CD',
    hasActivityPermit: true,
    ...overrides,
  };
}

function makeHire(overrides: Partial<HireInput> = {}): HireInput {
  return {
    weeklyHours: 20,
    jobCategory: '飲食店',
    inLongVacation: false,
    hireDate: '2026-06-01',
    ...overrides,
  };
}

describe('validate()', () => {
  // ---- EXPIRED ----
  it('在留期限切れ → EXPIRED', () => {
    const w = makeWorker({ residenceUntil: '2026-01-01' });
    const h = makeHire({ hireDate: '2026-06-01' });
    const result = validate(w, h);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('EXPIRED');
  });

  it('在留期限と雇入れ日が同日 → OK（当日は有効）', () => {
    const w = makeWorker({ residenceUntil: '2026-06-01' });
    const h = makeHire({ hireDate: '2026-06-01' });
    const result = validate(w, h);
    // residenceUntil < hireDate が条件なので同日はOK
    expect(result.ok).toBe(true);
  });

  // ---- PROHIBITED_JOB ----
  it('風俗営業 → PROHIBITED_JOB（許可があっても不可）', () => {
    const w = makeWorker({ hasActivityPermit: true });
    const h = makeHire({ jobCategory: 'キャバレー' });
    const result = validate(w, h);
    expect(result.ok).toBe(false);
    expect(result.code).toBe('PROHIBITED_JOB');
  });

  it('パチンコ → PROHIBITED_JOB', () => {
    const h = makeHire({ jobCategory: 'パチンコ' });
    const result = validate(makeWorker(), h);
    expect(result.code).toBe('PROHIBITED_JOB');
  });

  // ---- NO_PERMIT（留学） ----
  it('留学・許可なし → NO_PERMIT', () => {
    const w = makeWorker({ residenceStatus: '留学', hasActivityPermit: false });
    const result = validate(w, makeHire());
    expect(result.ok).toBe(false);
    expect(result.code).toBe('NO_PERMIT');
  });

  // ---- HOURS_EXCEEDED（留学・通常期） ----
  it('留学・通常期・週28h → OK（境界値）', () => {
    const w = makeWorker({ residenceStatus: '留学', hasActivityPermit: true });
    const result = validate(w, makeHire({ weeklyHours: 28 }));
    expect(result.ok).toBe(true);
  });

  it('留学・通常期・週28.5h相当（29h整数）→ HOURS_EXCEEDED', () => {
    const w = makeWorker({ residenceStatus: '留学', hasActivityPermit: true });
    const result = validate(w, makeHire({ weeklyHours: 29 }));
    expect(result.ok).toBe(false);
    expect(result.code).toBe('HOURS_EXCEEDED');
  });

  it('留学・通常期・週40h → HOURS_EXCEEDED', () => {
    const w = makeWorker({ residenceStatus: '留学', hasActivityPermit: true });
    const result = validate(w, makeHire({ weeklyHours: 40 }));
    expect(result.code).toBe('HOURS_EXCEEDED');
  });

  // ---- 留学・長期休業特例 ----
  it('留学・長期休業中・週40h → OK（特例上限）', () => {
    const w = makeWorker({ residenceStatus: '留学', hasActivityPermit: true });
    const result = validate(w, makeHire({ weeklyHours: 40, inLongVacation: true }));
    expect(result.ok).toBe(true);
  });

  it('留学・長期休業中・週41h → HOURS_EXCEEDED', () => {
    const w = makeWorker({ residenceStatus: '留学', hasActivityPermit: true });
    const result = validate(w, makeHire({ weeklyHours: 41, inLongVacation: true }));
    expect(result.ok).toBe(false);
    expect(result.code).toBe('HOURS_EXCEEDED');
  });

  // ---- 家族滞在 ----
  it('家族滞在・許可なし → NO_PERMIT', () => {
    const w = makeWorker({ residenceStatus: '家族滞在', hasActivityPermit: false });
    const result = validate(w, makeHire());
    expect(result.code).toBe('NO_PERMIT');
  });

  it('家族滞在・長期休業中・週40h → HOURS_EXCEEDED（特例なし）', () => {
    const w = makeWorker({ residenceStatus: '家族滞在', hasActivityPermit: true });
    const result = validate(w, makeHire({ weeklyHours: 40, inLongVacation: true }));
    expect(result.code).toBe('HOURS_EXCEEDED');
  });

  it('家族滞在・許可あり・週28h → OK', () => {
    const w = makeWorker({ residenceStatus: '家族滞在', hasActivityPermit: true });
    const result = validate(w, makeHire({ weeklyHours: 28 }));
    expect(result.ok).toBe(true);
  });

  // ---- 特定活動 ----
  it('特定活動・就労不可 → DESIGNATION_NO_WORK', () => {
    const w = makeWorker({
      residenceStatus: '特定活動',
      hasActivityPermit: false,
      designation: { workAllowed: false, weeklyCap: null },
    });
    const result = validate(w, makeHire());
    expect(result.code).toBe('DESIGNATION_NO_WORK');
  });

  it('特定活動・就労可・無制限・週99h → OK', () => {
    const w = makeWorker({
      residenceStatus: '特定活動',
      hasActivityPermit: false,
      designation: { workAllowed: true, weeklyCap: null },
    });
    const result = validate(w, makeHire({ weeklyHours: 99 }));
    expect(result.ok).toBe(true);
  });

  it('特定活動・就労可・週cap=20・週20h → OK（境界値）', () => {
    const w = makeWorker({
      residenceStatus: '特定活動',
      hasActivityPermit: false,
      designation: { workAllowed: true, weeklyCap: 20 },
    });
    const result = validate(w, makeHire({ weeklyHours: 20 }));
    expect(result.ok).toBe(true);
  });

  it('特定活動・就労可・週cap=20・週21h → HOURS_EXCEEDED', () => {
    const w = makeWorker({
      residenceStatus: '特定活動',
      hasActivityPermit: false,
      designation: { workAllowed: true, weeklyCap: 20 },
    });
    const result = validate(w, makeHire({ weeklyHours: 21 }));
    expect(result.code).toBe('HOURS_EXCEEDED');
  });

  // ---- OK ----
  it('正常ケース → OK', () => {
    const result = validate(makeWorker(), makeHire());
    expect(result.ok).toBe(true);
    expect(result.code).toBe('OK');
  });
});

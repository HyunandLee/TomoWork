import { describe, it, expect } from 'vitest';
import { canRate, averageStars, submitRating, RatingError } from '@/lib/ratings/ratings';
import type { Rating, HireEvent } from '@/lib/types';

// canRate, averageStars は純関数なのでDBなしでテスト可能
// submitRating は DB を呼ぶため、完了済み hire のみ境界値テスト

describe('canRate()', () => {
  it('status=completed → true', () => {
    expect(canRate({ status: 'completed' })).toBe(true);
  });
  it('status=pending → false', () => {
    expect(canRate({ status: 'pending' })).toBe(false);
  });
  it('status=active → false', () => {
    expect(canRate({ status: 'active' })).toBe(false);
  });
});

describe('averageStars()', () => {
  it('空配列 → { averageStars: 0, count: 0 }', () => {
    expect(averageStars([])).toEqual({ averageStars: 0, count: 0 });
  });

  it('単一評価', () => {
    const result = averageStars([{ stars: 4 }]);
    expect(result.averageStars).toBe(4);
    expect(result.count).toBe(1);
  });

  it('複数評価の平均', () => {
    const result = averageStars([{ stars: 5 }, { stars: 3 }, { stars: 4 }]);
    expect(result.count).toBe(3);
    expect(result.averageStars).toBeCloseTo(4, 2);
  });

  it('小数点2位で丸め', () => {
    // 1+2+3 = 6 / 3 = 2.00
    const result = averageStars([{ stars: 1 }, { stars: 2 }, { stars: 3 }]);
    expect(result.averageStars).toBe(2);
  });
});

describe('submitRating() バリデーション', () => {
  it('stars が 0 → RatingError', () => {
    expect(() =>
      submitRating({ hireId: 'h-1', raterRole: 'employer', stars: 0 })
    ).toThrow(RatingError);
  });

  it('stars が 6 → RatingError', () => {
    expect(() =>
      submitRating({ hireId: 'h-1', raterRole: 'worker', stars: 6 })
    ).toThrow(RatingError);
  });

  it('stars が小数 (1.5) → RatingError', () => {
    expect(() =>
      submitRating({ hireId: 'h-1', raterRole: 'employer', stars: 1.5 })
    ).toThrow(RatingError);
  });

  it('存在しない hireId → RatingError', () => {
    // DBなしなのでgetHireはundefを返す（migrate.tsがinitしていない環境）
    // エラーになることを期待
    expect(() =>
      submitRating({ hireId: 'non-existent', raterRole: 'employer', stars: 5 })
    ).toThrow(RatingError);
  });
});

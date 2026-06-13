// 相互レーティング：保存＋単純平均集計のみ（伝播・PageRankは実装しない）。
import type { Rating, RatingSummary, HireEvent } from '@/lib/types';
import { repo, now } from '@/lib/db/repo';
import { genId } from '@/lib/util/id';

export class RatingError extends Error {}

/**
 * 純関数: 評価可能か。
 * 書類提出後（active）以降の就労を、今月の働きのレビュー対象とする。
 * 未提出（pending）の就労はまだ評価できない。
 */
export function canRate(hire: Pick<HireEvent, 'status'>): boolean {
  return hire.status === 'active' || hire.status === 'completed';
}

/** 純関数: 単純平均集計（伝播・重み付けなし）。 */
export function averageStars(ratings: Pick<Rating, 'stars'>[]): RatingSummary {
  if (ratings.length === 0) return { averageStars: 0, count: 0 };
  const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
  return {
    averageStars: Math.round((sum / ratings.length) * 100) / 100,
    count: ratings.length,
  };
}

export interface SubmitRatingInput {
  hireId: string;
  raterRole: 'employer' | 'worker';
  stars: number;
  comment?: string;
}

/**
 * 評価を保存。完了済み就労のみ可。1 hire × 1 role で一意（重複は上書き）。
 * ratee は hire＋反対ロールで一意に定まる。
 */
export function submitRating(input: SubmitRatingInput): Rating {
  if (!Number.isInteger(input.stars) || input.stars < 1 || input.stars > 5) {
    throw new RatingError('星は1〜5の整数で指定してください');
  }
  const hire = repo.getHire(input.hireId);
  if (!hire) throw new RatingError('就労が見つかりません');
  if (!canRate(hire)) throw new RatingError('完了済みの就労のみ評価できます');

  const rating: Rating = {
    id: genId('rate'),
    hireId: input.hireId,
    raterRole: input.raterRole,
    stars: input.stars,
    comment: input.comment,
    createdAt: now(),
  };
  repo.upsertRating(rating);
  return rating;
}

/** worker が受けた星の平均（employer 評価）。 */
export function workerRatingSummary(workerId: string): RatingSummary {
  return averageStars(repo.listRatingsForWorker(workerId));
}

/** employer が受けた星の平均（worker 評価）。 */
export function employerRatingSummary(employerId: string): RatingSummary {
  return averageStars(repo.listRatingsForEmployer(employerId));
}

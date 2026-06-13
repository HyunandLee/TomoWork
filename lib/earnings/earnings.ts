// 稼ぎ記録＋合計（worker）。
import type { Earning } from '@/lib/types';
import { repo, now } from '@/lib/db/repo';
import { genId } from '@/lib/util/id';

export class EarningError extends Error {}

export interface RecordEarningInput {
  workerId: string;
  hireId: string;
  amount: number;
  workedOn: string; // ISO yyyy-mm-dd
}

export function recordEarning(input: RecordEarningInput): Earning {
  if (input.amount <= 0) throw new EarningError('金額は正の値で指定してください');
  const hire = repo.getHire(input.hireId);
  if (!hire) throw new EarningError('就労が見つかりません');
  if (hire.workerId !== input.workerId) throw new EarningError('自分の就労ではありません');

  const earning: Earning = {
    id: genId('earn'),
    workerId: input.workerId,
    hireId: input.hireId,
    amount: input.amount,
    workedOn: input.workedOn,
    createdAt: now(),
  };
  repo.insertEarning(earning);
  return earning;
}

export interface EarningsView {
  items: Earning[];
  total: number;
}

export function earningsForWorker(workerId: string): EarningsView {
  return {
    items: repo.listEarningsByWorker(workerId),
    total: repo.sumEarningsByWorker(workerId),
  };
}

/** wage × weeklyHours から初期値を提案（UI のプレフィル用）。 */
export function suggestWeeklyAmount(wage: number, weeklyHours: number): number {
  return Math.round(wage * weeklyHours);
}

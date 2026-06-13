// フォームレジストリ。様式第3号を1エントリ登録。将来 様式第2号・労働条件通知書を追加可能に。
import type { Worker, Employer, HireEvent } from '@/lib/types';
import { mapToShiki3, SHIKI3_TITLE, type Shiki3Doc } from './mapToShiki3';

export interface FormEntry<TDoc = unknown> {
  id: string;
  titleJa: string;
  /** worker/employer/hire からフォームドキュメント（フィールド配列）を生成 */
  build: (worker: Worker, employer: Employer, hire: HireEvent) => TDoc;
}

export const FORM_REGISTRY: Record<string, FormEntry> = {
  shiki3: {
    id: 'shiki3',
    titleJa: SHIKI3_TITLE,
    build: (w, e, h) => mapToShiki3(w, e, h),
  },
  // 将来: shiki2, laborConditionsNotice ...
};

export function getForm(id: string): FormEntry | undefined {
  return FORM_REGISTRY[id];
}

export function buildShiki3(
  worker: Worker,
  employer: Employer,
  hire: HireEvent,
): Shiki3Doc {
  return mapToShiki3(worker, employer, hire);
}

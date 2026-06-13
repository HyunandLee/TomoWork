// 風俗営業等：資格外活動許可があっても就労不可の業種（単一ソース）。

export const PROHIBITED_JOBS = [
  'パチンコ',
  '麻雀',
  'ゲームセンター',
  'キャバレー',
  'ナイトクラブ',
  'ホストクラブ',
  'ダンスホール',
  '性風俗',
] as const;

export type ProhibitedJob = (typeof PROHIBITED_JOBS)[number];

/**
 * jobCategory が禁止業種に該当するか。
 * 部分一致で判定（例: "ゲームセンター店員" も該当）。
 */
export function isProhibitedJob(jobCategory: string): boolean {
  const normalized = jobCategory.trim();
  return PROHIBITED_JOBS.some((p) => normalized.includes(p));
}

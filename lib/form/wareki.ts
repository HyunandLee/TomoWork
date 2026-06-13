// 西暦 ISO 日付 → 和暦表記（純関数）。
interface Era {
  name: string;
  start: string; // ISO yyyy-mm-dd（その元号の開始日）
}

// 新しい順
const ERAS: Era[] = [
  { name: '令和', start: '2019-05-01' },
  { name: '平成', start: '1989-01-08' },
  { name: '昭和', start: '1926-12-25' },
  { name: '大正', start: '1912-07-30' },
  { name: '明治', start: '1868-01-25' },
];

/** "2000-03-04" → "平成12年3月4日" */
export function toWareki(iso: string): string {
  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  const era = ERAS.find((e) => iso >= e.start);
  if (!era) return iso; // 明治以前はそのまま
  const eraStartYear = parseInt(era.start.slice(0, 4), 10);
  const eraYear = y - eraStartYear + 1;
  const yearLabel = eraYear === 1 ? '元' : String(eraYear);
  return `${era.name}${yearLabel}年${m}月${d}日`;
}

/** "2000-03-04" → "西暦2000年3月4日（平成12年3月4日）" */
export function toSeirekiWithWareki(iso: string): string {
  const [y, m, d] = iso.split('-').map((n) => parseInt(n, 10));
  return `${y}年${m}月${d}日（${toWareki(iso)}）`;
}

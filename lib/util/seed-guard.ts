// サーバーサイド共通: 起動時の自動シード（lazy）。
export async function ensureSeeded() {
  try {
    const { getDb } = await import('@/lib/db/migrate');
    const { runSeed } = await import('@/lib/seed');
    const db = getDb();
    const count = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
    if (count === 0) await runSeed();
  } catch (e) {
    console.error('[ensureSeeded] error:', e);
  }
}

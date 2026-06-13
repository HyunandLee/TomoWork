// DB シングルトン＋起動時マイグレーション（better-sqlite3）。
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.TUNAWORK_DB ?? path.join(process.cwd(), 'data', 'app.db');

// Next.js の HMR で複数接続が作られないよう global にキャッシュ。
const globalForDb = globalThis as unknown as {
  __tunaworkDb?: Database.Database;
  __tunaworkSeeded?: boolean;
};

function applySchema(db: Database.Database) {
  const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
  const ddl = fs.readFileSync(schemaPath, 'utf8');
  db.exec(ddl);
}

export function getDb(): Database.Database {
  if (globalForDb.__tunaworkDb) return globalForDb.__tunaworkDb;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  applySchema(db);

  globalForDb.__tunaworkDb = db;
  return db;
}

/** スキーマを全削除して作り直す（reset 用）。 */
export function resetSchema(db: Database.Database) {
  const tables = [
    'notifications',
    'earnings',
    'ratings',
    'submissions',
    'hire_events',
    'applications',
    'job_postings',
    'users',
    'workers',
    'employers',
  ];
  db.pragma('foreign_keys = OFF');
  const drop = db.transaction(() => {
    for (const t of tables) db.exec(`DROP TABLE IF EXISTS ${t};`);
  });
  drop();
  applySchema(db);
  db.pragma('foreign_keys = ON');
  globalForDb.__tunaworkSeeded = false;
}

export function markSeeded() {
  globalForDb.__tunaworkSeeded = true;
}
export function isSeeded(): boolean {
  return globalForDb.__tunaworkSeeded ?? false;
}

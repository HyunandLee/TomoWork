import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { getDb, resetSchema } from '@/lib/db/migrate';
import { runSeed } from '@/lib/seed';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return err('本番環境では使用できません', 403);
  }
  const user = await getSessionUser();
  try {
    ensureRole(user, ['admin']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }

  const db = getDb();
  resetSchema(db);
  await runSeed();
  return ok({ message: 'シードリセット完了' });
}

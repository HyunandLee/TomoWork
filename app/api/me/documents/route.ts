import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { repo } from '@/lib/db/repo';

export async function GET() {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['worker']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }
  if (!user!.linkedWorkerId) return err('労働者が紐づいていません', 400);

  return ok(repo.listSubmissionsByWorker(user!.linkedWorkerId));
}

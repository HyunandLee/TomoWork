import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { repo } from '@/lib/db/repo';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return err('ログインが必要です', 401);

  if (user.role === 'admin') {
    return ok(repo.listAllSubmissions());
  }
  if (user.role === 'employer' && user.linkedEmployerId) {
    return ok(repo.listSubmissionsByEmployer(user.linkedEmployerId));
  }
  if (user.role === 'worker' && user.linkedWorkerId) {
    return ok(repo.listSubmissionsByWorker(user.linkedWorkerId));
  }
  return err('権限がありません', 403);
}

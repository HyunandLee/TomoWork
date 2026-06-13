import { NextRequest } from 'next/server';
import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { applyToJob, listApplicantsForEmployer, listApplicationsForWorker } from '@/lib/jobs/applications';
import type { PostApplicationBody } from '@/lib/api/contracts';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return err('ログインが必要です', 401);

  if (user.role === 'employer' && user.linkedEmployerId) {
    return ok(listApplicantsForEmployer(user.linkedEmployerId));
  }
  if (user.role === 'worker' && user.linkedWorkerId) {
    return ok(listApplicationsForWorker(user.linkedWorkerId));
  }
  return err('権限がありません', 403);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['worker']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }
  if (!user!.linkedWorkerId) return err('労働者が紐づいていません', 400);

  const body: PostApplicationBody = await req.json();
  try {
    const app = applyToJob(body.jobId, user!.linkedWorkerId);
    return ok(app);
  } catch (e: unknown) {
    return err((e as Error).message);
  }
}

import { NextRequest } from 'next/server';
import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { listOpenJobs, createJob } from '@/lib/jobs/postings';
import { repo } from '@/lib/db/repo';
import type { PostJobBody } from '@/lib/api/contracts';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return err('ログインが必要です', 401);

  if (user.role === 'employer' && user.linkedEmployerId) {
    return ok(repo.listJobsByEmployer(user.linkedEmployerId));
  }
  // worker / admin: open のみ
  return ok(listOpenJobs());
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['employer']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }
  if (!user!.linkedEmployerId) return err('事業所が紐づいていません', 400);

  const body: PostJobBody = await req.json();
  const job = createJob({
    employerId: user!.linkedEmployerId,
    ...body,
  });
  return ok(job);
}

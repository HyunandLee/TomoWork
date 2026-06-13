import { NextRequest } from 'next/server';
import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { submitShiki3, SubmissionRejected } from '@/lib/submission/submit';
import type { HireSubmitBody } from '@/lib/api/contracts';
import { repo } from '@/lib/db/repo';

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['employer', 'admin']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }

  const body: HireSubmitBody = await req.json();
  const hire = repo.getHire(body.hireId);
  if (!hire) return err('雇用イベントが見つかりません', 404);
  if (user!.role === 'employer' && hire.employerId !== user!.linkedEmployerId) {
    return err('自社の雇用イベントではありません', 403);
  }

  try {
    const submission = submitShiki3(body.hireId);
    return ok(submission);
  } catch (e: unknown) {
    if (e instanceof SubmissionRejected) {
      return err(e.message, 422, e.code);
    }
    return err((e as Error).message);
  }
}

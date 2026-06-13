import { NextRequest } from 'next/server';
import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { earningsForWorker, recordEarning, EarningError } from '@/lib/earnings/earnings';
import type { PostEarningBody } from '@/lib/api/contracts';

export async function GET() {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['worker']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }
  if (!user!.linkedWorkerId) return err('労働者が紐づいていません', 400);

  return ok(earningsForWorker(user!.linkedWorkerId));
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['worker']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }
  if (!user!.linkedWorkerId) return err('労働者が紐づいていません', 400);

  const body: PostEarningBody = await req.json();
  try {
    const earning = recordEarning({
      workerId: user!.linkedWorkerId,
      hireId: body.hireId,
      amount: body.amount,
      workedOn: body.workedOn,
    });
    return ok(earning);
  } catch (e: unknown) {
    if (e instanceof EarningError) return err(e.message);
    return err((e as Error).message);
  }
}

import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { earningsForWorker } from '@/lib/earnings/earnings';

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

export async function POST() {
  return err('稼ぎ記録は雇用主の提出データから自動反映されます', 405);
}

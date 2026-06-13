import { NextRequest } from 'next/server';
import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { acceptApplication } from '@/lib/jobs/applications';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['employer']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }
  if (!user!.linkedEmployerId) return err('事業所が紐づいていません', 400);

  const { id } = await params;
  try {
    const hire = acceptApplication(id, user!.linkedEmployerId);
    return ok(hire);
  } catch (e: unknown) {
    return err((e as Error).message);
  }
}

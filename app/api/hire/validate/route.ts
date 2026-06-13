import { NextRequest } from 'next/server';
import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { validate } from '@/lib/rules/validate';
import { repo } from '@/lib/db/repo';
import type { HireValidateBody } from '@/lib/api/contracts';

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['employer', 'admin']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }

  const body: HireValidateBody = await req.json();
  const worker = repo.getWorker(body.workerId);
  if (!worker) return err('労働者が見つかりません', 404);

  const result = validate(worker, {
    weeklyHours: body.weeklyHours,
    jobCategory: body.jobCategory,
    inLongVacation: body.inLongVacation,
    hireDate: body.hireDate,
    shifts: body.shifts,
  });
  return ok(result);
}

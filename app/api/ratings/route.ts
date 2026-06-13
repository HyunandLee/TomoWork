import { NextRequest } from 'next/server';
import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { submitRating, workerRatingSummary, employerRatingSummary, RatingError } from '@/lib/ratings/ratings';
import type { PostRatingBody } from '@/lib/api/contracts';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return err('ログインが必要です', 401);

  const { searchParams } = new URL(req.url);
  const subjectRole = searchParams.get('subjectRole');
  const id = searchParams.get('id');
  if (!subjectRole || !id) return err('subjectRole と id が必要です');

  if (subjectRole === 'worker') return ok(workerRatingSummary(id));
  if (subjectRole === 'employer') return ok(employerRatingSummary(id));
  return err('subjectRole は worker か employer を指定してください');
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['employer', 'worker']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }

  const body: PostRatingBody = await req.json();
  // raterRole が session ロールと一致するか確認
  if (
    (body.raterRole === 'employer' && user!.role !== 'employer') ||
    (body.raterRole === 'worker' && user!.role !== 'worker')
  ) {
    return err('自分のロールで評価してください', 403);
  }

  try {
    const rating = submitRating(body);
    return ok(rating);
  } catch (e: unknown) {
    if (e instanceof RatingError) return err(e.message);
    return err((e as Error).message);
  }
}

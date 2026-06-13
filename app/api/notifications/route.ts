import { getSessionUser, ok, err } from '@/lib/api/helpers';
import { ensureRole } from '@/lib/auth/guards';
import { repo } from '@/lib/db/repo';

/** 労働者の通知一覧＋未読件数を返す。 */
export async function GET() {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['worker']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }
  if (!user!.linkedWorkerId) return err('労働者が紐づいていません', 400);

  const items = repo.listNotificationsByWorker(user!.linkedWorkerId).map((n) => {
    const employer = n.employerId ? repo.getEmployer(n.employerId) : undefined;
    return { ...n, employerName: employer?.officeName };
  });
  const unread = repo.countUnreadNotifications(user!.linkedWorkerId);
  return ok({ items, unread });
}

/** 通知をすべて既読にする。 */
export async function POST() {
  const user = await getSessionUser();
  try {
    ensureRole(user, ['worker']);
  } catch (e: unknown) {
    return err((e as Error).message, 403);
  }
  if (!user!.linkedWorkerId) return err('労働者が紐づいていません', 400);

  repo.markNotificationsRead(user!.linkedWorkerId);
  return ok({ unread: 0 });
}

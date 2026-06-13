import { auth } from '@/lib/auth/options';
import { redirect, notFound } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { Locale } from '@/app/worker/dictionaries';
import type { SessionUser } from '@/lib/types';
import WorkerRateClient, { type PendingReview } from './WorkerRateClient';

export default async function WorkerRatePage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ hireId?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedWorkerId) redirect('/login');

  const dict = await getDictionary(lang as Locale);
  const { hireId } = await searchParams;

  // 書類提出後（active 以降）の就労を、今月の働きのレビュー候補として提示。
  const pendingReviews: PendingReview[] = repo
    .listHiresByWorker(user.linkedWorkerId)
    .filter((h) => h.status === 'active' || h.status === 'completed')
    .map((h) => {
      const employer = repo.getEmployer(h.employerId);
      const job = h.jobId ? repo.getJob(h.jobId) : undefined;
      return {
        hireId: h.id,
        employerName: employer?.officeName ?? h.employerId,
        jobTitle: job?.title ?? h.jobCategory,
        month: h.hireDate.slice(0, 7),
        rated: Boolean(repo.getRating(h.id, 'worker')),
      };
    });

  return (
    <WorkerRateClient
      d={dict.rate}
      prefillHireId={hireId ?? ''}
      pendingReviews={pendingReviews}
    />
  );
}

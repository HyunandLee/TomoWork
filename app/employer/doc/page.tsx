import { auth } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { previewShiki3 } from '@/lib/submission/submit';
import { runSeed } from '@/lib/seed';
import { getDb } from '@/lib/db/migrate';
import type { SessionUser } from '@/lib/types';
import { validate } from '@/lib/rules/validate';
import DocClient from './DocClient';

function ensureSeeded() {
  try {
    const db = getDb();
    const count = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
    if (count === 0) runSeed();
  } catch { /* ignore */ }
}

export default async function EmployerDocPage({
  searchParams,
}: {
  searchParams: Promise<{ hireId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedEmployerId) redirect('/login');

  ensureSeeded();

  const { hireId } = await searchParams;

  const allHires = repo.listHiresByEmployer(user.linkedEmployerId);
  const pendingHires = allHires
    .filter(h => h.status === 'pending')
    .filter((h) => {
      const worker = repo.getWorker(h.workerId);
      if (!worker) return false;
      return validate(worker, {
        weeklyHours: h.weeklyHours,
        jobCategory: h.jobCategory,
        inLongVacation: h.inLongVacation,
        hireDate: h.hireDate,
        shifts: h.shifts,
      }).ok;
    })
    .map((h) => {
      const worker = repo.getWorker(h.workerId);
      const job = h.jobId ? repo.getJob(h.jobId) : undefined;
      return {
        ...h,
        workerName: worker?.nameRoman ?? h.workerId,
        workerNameKana: worker?.nameKana ?? h.workerId,
        jobTitle: job?.title ?? h.jobCategory,
      };
    });

  let preview = null;

  if (hireId) {
    preview = previewShiki3(hireId);
  }

  return (
    <DocClient
      pendingHires={pendingHires}
      selectedHireId={hireId}
      preview={preview ?? undefined}
    />
  );
}

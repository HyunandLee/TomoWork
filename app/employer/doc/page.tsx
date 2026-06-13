import { auth } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { previewShiki3, submitShiki3, SubmissionRejected } from '@/lib/submission/submit';
import { runSeed } from '@/lib/seed';
import { getDb } from '@/lib/db/migrate';
import type { SessionUser } from '@/lib/types';
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
  searchParams: Promise<{ hireId?: string; submitted?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedEmployerId) redirect('/login');

  ensureSeeded();

  const { hireId, submitted } = await searchParams;

  // 利用可能な hire 一覧（pending）
  const allHires = repo.listHiresByEmployer(user.linkedEmployerId);
  const pendingHires = allHires.filter(h => h.status === 'pending' || h.status === 'active');

  let preview = null;
  let submission = null;
  let submitError = null;

  if (hireId) {
    preview = previewShiki3(hireId);
  }

  if (submitted === '1' && hireId) {
    try {
      submission = submitShiki3(hireId);
    } catch (e) {
      if (e instanceof SubmissionRejected) {
        submitError = e.message;
      }
    }
  }

  return (
    <DocClient
      pendingHires={pendingHires}
      selectedHireId={hireId}
      preview={preview ?? undefined}
      submission={submission ?? undefined}
      submitError={submitError ?? undefined}
    />
  );
}

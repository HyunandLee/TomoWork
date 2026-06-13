import { auth } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { runSeed } from '@/lib/seed';
import { getDb } from '@/lib/db/migrate';
import type { SessionUser } from '@/lib/types';
import Link from 'next/link';

function ensureSeeded() {
  try {
    const db = getDb();
    const count = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
    if (count === 0) runSeed();
  } catch { /* ignore */ }
}

export default async function EmployerDashboard() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedEmployerId) redirect('/login');

  ensureSeeded();

  const employer = repo.getEmployer(user.linkedEmployerId);
  const hires = repo.listHiresByEmployer(user.linkedEmployerId);
  const submissions = repo.listSubmissionsByEmployer(user.linkedEmployerId);
  const jobs = repo.listJobsByEmployer(user.linkedEmployerId);
  const applications = repo.listApplicationsByEmployer(user.linkedEmployerId);

  const pendingHires = hires.filter(h => h.status === 'pending');
  const completedHires = hires.filter(h => h.status === 'completed');
  const openJobs = jobs.filter(j => j.status === 'open');

  return (
    <div className="page-body">
      <div className="page-header">
        <h1>🏢 ダッシュボード</h1>
        <p>{employer?.officeName} — {employer?.officeAddress}</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">公開中の求人</div>
          <div className="stat-value">{openJobs.length}</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-label">応募者数</div>
          <div className="stat-value">{applications.length}</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-label">届出待ち</div>
          <div className="stat-value">{pendingHires.length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">提出済み届出</div>
          <div className="stat-value">{submissions.length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">完了済み就労</div>
          <div className="stat-value">{completedHires.length}</div>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <div className="card-title">📋 届出待ち — 要対応</div>
          {pendingHires.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              <p className="text-muted text-sm">待機中の就労はありません</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {pendingHires.map(h => {
                const worker = repo.getWorker(h.workerId);
                return (
                  <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.625rem .875rem', background: 'var(--blue-pale2)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '.9rem' }}>{worker?.nameRoman ?? h.workerId}</div>
                      <div style={{ fontSize: '.78rem', color: 'var(--gray-500)' }}>{h.jobCategory} / 週{h.weeklyHours}h / {h.hireDate}</div>
                    </div>
                    <Link href={`/employer/doc?hireId=${h.id}`} className="btn btn-primary btn-sm">
                      📄 書類生成
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">📁 最近の届出</div>
          {submissions.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              <p className="text-muted text-sm">届出がありません</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>受付番号</th>
                  <th>提出日</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {submissions.slice(0, 5).map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{s.receiptNo}</td>
                    <td style={{ fontSize: '.82rem' }}>{s.createdAt.slice(0, 10)}</td>
                    <td><span className="badge badge-green">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card mt-lg">
        <div className="card-title">🚀 クイックアクション</div>
        <div className="flex gap" style={{ flexWrap: 'wrap' }}>
          <Link href="/employer/jobs" className="btn btn-primary">📋 求人を投稿する</Link>
          <Link href="/employer/applicants" className="btn btn-secondary">👥 応募者を確認する</Link>
          <Link href="/employer/doc" className="btn btn-secondary">📄 書類を生成する</Link>
          <Link href="/employer/history" className="btn btn-secondary">📁 届出履歴</Link>
        </div>
      </div>
    </div>
  );
}

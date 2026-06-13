import { auth } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { workerRatingSummary } from '@/lib/ratings/ratings';
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

export default async function WorkerDashboard() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedWorkerId) redirect('/login');

  ensureSeeded();

  const worker = repo.getWorker(user.linkedWorkerId);
  const hires = repo.listHiresByWorker(user.linkedWorkerId);
  const submissions = repo.listSubmissionsByWorker(user.linkedWorkerId);
  const earnings = repo.listEarningsByWorker(user.linkedWorkerId);
  const totalEarnings = repo.sumEarningsByWorker(user.linkedWorkerId);
  const ratingSummary = workerRatingSummary(user.linkedWorkerId);
  const applications = repo.listApplicationsByWorker(user.linkedWorkerId);

  const completedHires = hires.filter(h => h.status === 'completed');
  const activeHires = hires.filter(h => h.status !== 'completed');

  return (
    <div className="page-body">
      <div className="page-header">
        <h1>👷 ダッシュボード</h1>
        {worker && (
          <p>{worker.nameKana}（{worker.nameRoman}）— {worker.residenceStatus} / 在留期限: {worker.residenceUntil}</p>
        )}
      </div>

      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">応募中</div>
          <div className="stat-value">{applications.filter(a => a.status === 'applied').length}</div>
        </div>
        <div className="stat-card navy">
          <div className="stat-label">採用済み</div>
          <div className="stat-value">{applications.filter(a => a.status === 'accepted').length}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">提出書類数</div>
          <div className="stat-value">{submissions.length}</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-label">総稼ぎ額</div>
          <div className="stat-value">¥{totalEarnings.toLocaleString()}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">平均評価</div>
          <div className="stat-value">
            {ratingSummary.count > 0 ? `${ratingSummary.averageStars.toFixed(1)}★` : '—'}
          </div>
          <div className="stat-sub">{ratingSummary.count}件の評価</div>
        </div>
      </div>

      {worker && (
        <div className="card mb-lg">
          <div className="card-title">🪪 在留情報</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.75rem', fontSize: '.875rem' }}>
            <div><span style={{ color: 'var(--gray-500)' }}>在留資格：</span><strong>{worker.residenceStatus}</strong></div>
            <div><span style={{ color: 'var(--gray-500)' }}>在留期限：</span><strong>{worker.residenceUntil}</strong></div>
            <div><span style={{ color: 'var(--gray-500)' }}>国籍：</span><strong>{worker.nationality}</strong></div>
            <div><span style={{ color: 'var(--gray-500)' }}>資格外活動許可：</span>
              <span className={`badge ${worker.hasActivityPermit ? 'badge-green' : 'badge-red'}`} style={{ marginLeft: '.25rem' }}>
                {worker.hasActivityPermit ? '有' : '無'}
              </span>
            </div>
            <div><span style={{ color: 'var(--gray-500)' }}>在留カード番号：</span><code style={{ fontSize: '.8rem' }}>{worker.residenceCardNo}</code></div>
          </div>
        </div>
      )}

      <div className="card-grid">
        <div className="card">
          <div className="card-title">📁 最近の書類</div>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted">書類がありません</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {submissions.slice(0, 3).map(s => (
                <div key={s.id} style={{ padding: '.5rem .75rem', background: 'var(--blue-pale2)', borderRadius: '8px', fontSize: '.85rem' }}>
                  <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{s.receiptNo}</div>
                  <div style={{ color: 'var(--gray-500)' }}>{s.createdAt.slice(0, 10)}</div>
                </div>
              ))}
            </div>
          )}
          <Link href="/worker/documents" className="btn btn-secondary btn-sm mt-sm">全件見る →</Link>
        </div>

        <div className="card">
          <div className="card-title">💴 最近の稼ぎ</div>
          {earnings.length === 0 ? (
            <p className="text-sm text-muted">稼ぎ記録がありません</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {earnings.slice(0, 3).map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem .75rem', background: 'var(--green-light)', borderRadius: '8px', fontSize: '.85rem' }}>
                  <span>{e.workedOn}</span>
                  <strong>¥{e.amount.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          )}
          <Link href="/worker/earnings" className="btn btn-secondary btn-sm mt-sm">全件見る →</Link>
        </div>
      </div>

      <div className="card mt-lg">
        <div className="card-title">🚀 クイックアクション</div>
        <div className="flex gap" style={{ flexWrap: 'wrap' }}>
          <Link href="/worker/jobs" className="btn btn-primary">🔍 バイト先を探す</Link>
          <Link href="/worker/documents" className="btn btn-secondary">📄 自分の書類</Link>
          <Link href="/worker/earnings" className="btn btn-secondary">💴 稼ぎを記録</Link>
          <Link href="/worker/rate" className="btn btn-secondary">⭐ 雇用主を評価</Link>
        </div>
      </div>
    </div>
  );
}

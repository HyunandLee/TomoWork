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
  const weeklyUsed = activeHires.reduce((sum, h) => sum + h.weeklyHours, 0);
  const weeklyCap = worker?.residenceStatus === '特定活動'
    ? worker.designation?.weeklyCap ?? 40
    : 28;
  const weeklyPct = Math.min(100, Math.round((weeklyUsed / weeklyCap) * 100));

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>TunaWork Worker</div>
          <h1><ruby>仕事<rt>しごと</rt></ruby></h1>
          {worker && <p>{worker.nameRoman} / {worker.nationality} / 在留期限 {worker.residenceUntil}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.78rem', opacity: .75, fontWeight: 700 }}>あなたの評価</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {ratingSummary.count > 0 ? `${ratingSummary.averageStars.toFixed(1)} ★` : '—'}
          </div>
          <div style={{ fontSize: '.78rem', opacity: .75 }}>{ratingSummary.count}件</div>
        </div>
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
        <div className="card">
          <div className="tw-row-between" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div className="tw-kicker">在留資格チェック</div>
              <h2 style={{ marginTop: '.15rem' }}><ruby>{worker.residenceStatus}<rt>ざいりゅうしかく</rt></ruby></h2>
            </div>
            <span className={`tw-chip ${worker.hasActivityPermit || worker.residenceStatus === '特定活動' ? '' : 'tw-chip-coral'}`}>
              {worker.hasActivityPermit || worker.residenceStatus === '特定活動' ? '就労条件あり' : '許可なし'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '.78rem', color: 'var(--tw-muted)', fontWeight: 800 }}>今週の予定時間</div>
              <div className="tw-row-between" style={{ margin: '.25rem 0 .45rem' }}>
                <strong>{weeklyUsed} / {weeklyCap}h</strong>
                <span style={{ color: weeklyUsed > weeklyCap ? 'var(--tw-coral)' : 'var(--tw-primary-dark)', fontWeight: 800 }}>
                  {weeklyUsed > weeklyCap ? '要確認' : 'OK'}
                </span>
              </div>
              <div className="tw-progress"><span style={{ width: `${weeklyPct}%`, background: weeklyUsed > weeklyCap ? 'var(--tw-coral)' : 'var(--tw-primary)' }} /></div>
            </div>
            <div><span style={{ color: 'var(--tw-muted)' }}>在留カード番号</span><br /><strong>{worker.residenceCardNo}</strong></div>
            <div><span style={{ color: 'var(--tw-muted)' }}>完了した仕事</span><br /><strong>{completedHires.length}件</strong></div>
            <div><span style={{ color: 'var(--tw-muted)' }}>これからの仕事</span><br /><strong>{activeHires.length}件</strong></div>
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
          <Link href="/worker/earnings" className="btn btn-secondary btn-sm mt-sm">マイページで見る →</Link>
        </div>
      </div>

      <div className="card mt-lg">
        <div className="card-title">次にすること</div>
        <div className="tw-actions">
          <Link href="/worker/jobs" className="btn btn-primary">バイト先を探す</Link>
          <Link href="/worker/documents" className="btn btn-secondary">自分の書類</Link>
          <Link href="/worker/earnings" className="btn btn-secondary">マイページ</Link>
          <Link href="/worker/rate" className="btn btn-secondary">雇用主を評価</Link>
        </div>
      </div>
    </div>
  );
}

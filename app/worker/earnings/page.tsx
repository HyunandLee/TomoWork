import { auth } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { workerRatingSummary } from '@/lib/ratings/ratings';
import type { Earning, SessionUser } from '@/lib/types';

function monthLabel(month: string): string {
  const [, m] = month.split('-');
  return `${Number(m)}月`;
}

function groupByMonth(earnings: Earning[]) {
  const map = new Map<string, number>();
  for (const earning of earnings) {
    const key = earning.workedOn.slice(0, 7);
    map.set(key, (map.get(key) ?? 0) + earning.amount);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({ month, amount }));
}

export default async function WorkerEarningsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedWorkerId) redirect('/login');

  const worker = repo.getWorker(user.linkedWorkerId);
  const earnings = repo.listEarningsByWorker(user.linkedWorkerId);
  const total = repo.sumEarningsByWorker(user.linkedWorkerId);
  const rating = workerRatingSummary(user.linkedWorkerId);
  const monthly = groupByMonth(earnings);
  const maxMonthly = Math.max(1, ...monthly.map((item) => item.amount));

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>My Page</div>
          <h1>マイページ</h1>
          <p>評価、稼ぎ、提出済みデータを確認できます。</p>
        </div>
        <span className="tw-chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>自動反映</span>
      </div>

      <div className="card">
        <div className="tw-row-between" style={{ alignItems: 'flex-end' }}>
          <div className="tw-row">
            <span className="tw-avatar" style={{ width: 64, height: 64, fontSize: '1.35rem' }}>
              {worker?.nameKana.slice(0, 1) ?? '人'}
            </span>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {worker?.nameRoman ?? 'Worker'} <span style={{ color: 'var(--tw-muted)', fontSize: '.9rem' }}>（{worker?.nameKana ?? '—'}）</span>
              </div>
              <div style={{ color: 'var(--tw-muted)', fontWeight: 700, fontSize: '.86rem' }}>
                {worker?.nationality ?? '—'} / {worker?.residenceStatus ?? '—'}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tw-stars">{rating.count > 0 ? `★ ${rating.averageStars.toFixed(1)}` : '★ —'}</div>
            <div style={{ color: 'var(--tw-muted)', fontSize: '.75rem', fontWeight: 800 }}>{rating.count}件の評価</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--tw-primary)', color: '#fff', border: 'none' }}>
        <div style={{ opacity: .86, fontWeight: 800, fontSize: '.8rem' }}>これまで ぜんぶ</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.15 }}>¥{total.toLocaleString()}</div>
        <div style={{ opacity: .8, fontWeight: 700, fontSize: '.85rem', marginTop: '.35rem' }}>
          雇用主の書類提出・就労データから反映
        </div>
      </div>

      <div className="tw-soft-panel">
        <div className="tw-row">
          <span className="tw-avatar">¥</span>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>自分では編集できません</div>
            <div style={{ color: 'var(--tw-muted)', fontSize: '.88rem' }}>
              給与は、雇用主が提出した様式第3号と就労条件（時給・週時間）をもとに反映されます。
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">月ごとの稼ぎ</div>
        {monthly.length === 0 ? (
          <p className="text-sm text-muted">提出後にグラフが表示されます</p>
        ) : (
          <div className="salary-chart" aria-label="月ごとの稼ぎグラフ">
            {monthly.map((item) => (
              <div key={item.month} className="salary-bar-row">
                <div className="salary-bar-label">{monthLabel(item.month)}</div>
                <div className="salary-bar-track">
                  <span style={{ width: `${Math.max(8, Math.round((item.amount / maxMonthly) * 100))}%` }} />
                </div>
                <div className="salary-bar-value">¥{item.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {earnings.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">¥</div>
          <h3>稼ぎ記録がありません</h3>
          <p>雇用主が書類を提出すると、ここに自動で反映されます</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {earnings.map((earning) => {
            const hire = repo.getHire(earning.hireId);
            const employer = hire ? repo.getEmployer(hire.employerId) : undefined;
            return (
              <div key={earning.id} className="card">
                <div className="tw-row-between">
                  <div>
                    <div style={{ fontWeight: 800 }}>{earning.workedOn.slice(0, 7)} 分</div>
                    <div style={{ color: 'var(--tw-muted)', fontSize: '.8rem' }}>
                      {employer?.officeName ?? '雇用主'} / {hire?.jobCategory ?? earning.hireId}
                    </div>
                  </div>
                  <div style={{ color: 'var(--tw-primary-dark)', fontSize: '1.15rem', fontWeight: 800 }}>+¥{earning.amount.toLocaleString()}</div>
                </div>
                <div style={{ color: 'var(--tw-muted)', fontSize: '.78rem', marginTop: '.35rem' }}>
                  提出データ由来 / hire: {earning.hireId}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

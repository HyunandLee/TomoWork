import { auth } from '@/lib/auth/options';
import { redirect, notFound } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { workerRatingSummary } from '@/lib/ratings/ratings';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { SessionUser, Earning } from '@/lib/types';
import type { Locale } from '@/app/worker/dictionaries';

function monthLabel(month: string, lang: string): string {
  const [, m] = month.split('-');
  if (lang === 'ja') return `${Number(m)}月`;
  if (lang === 'vi') return `Tháng ${Number(m)}`;
  return `Month ${Number(m)}`;
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

export default async function WorkerEarningsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedWorkerId) redirect('/login');

  const dict = await getDictionary(lang as Locale);
  const d = dict.earnings;

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
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>{d.kicker}</div>
          <h1>{d.title}</h1>
          <p>{d.description}</p>
        </div>
        <span className="tw-chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{d.auto_chip}</span>
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
            <div style={{ color: 'var(--tw-muted)', fontSize: '.75rem', fontWeight: 800 }}>{rating.count}{d.row.ratings_suffix}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--tw-primary)', color: '#fff', border: 'none' }}>
        <div style={{ opacity: .86, fontWeight: 800, fontSize: '.8rem' }}>{d.total_label}</div>
        <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.15 }}>¥{total.toLocaleString()}</div>
        <div style={{ opacity: .8, fontWeight: 700, fontSize: '.85rem', marginTop: '.35rem' }}>
          {d.total_note}
        </div>
      </div>

      <div className="tw-soft-panel">
        <div className="tw-row">
          <span className="tw-avatar">¥</span>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>{d.no_edit.title}</div>
            <div style={{ color: 'var(--tw-muted)', fontSize: '.88rem' }}>
              {d.no_edit.desc}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{d.chart.title}</div>
        {monthly.length === 0 ? (
          <p className="text-sm text-muted">{d.chart.empty}</p>
        ) : (
          <div className="salary-chart" aria-label={d.chart.aria}>
            {monthly.map((item) => (
              <div key={item.month} className="salary-bar-row">
                <div className="salary-bar-label">{monthLabel(item.month, lang)}</div>
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
          <h3>{d.empty.title}</h3>
          <p>{d.empty.desc}</p>
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
                    <div style={{ fontWeight: 800 }}>{earning.workedOn.slice(0, 7)}{d.row.month_suffix}</div>
                    <div style={{ color: 'var(--tw-muted)', fontSize: '.8rem' }}>
                      {employer?.officeName ?? d.row.default_employer} / {hire?.jobCategory ?? earning.hireId}
                    </div>
                  </div>
                  <div style={{ color: 'var(--tw-primary-dark)', fontSize: '1.15rem', fontWeight: 800 }}>+¥{earning.amount.toLocaleString()}</div>
                </div>
                <div style={{ color: 'var(--tw-muted)', fontSize: '.78rem', marginTop: '.35rem' }}>
                  {d.row.source_note} / hire: {earning.hireId}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

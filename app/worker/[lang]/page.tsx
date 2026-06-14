import { auth } from '@/lib/auth/options';
import { redirect, notFound } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { workerRatingSummary } from '@/lib/ratings/ratings';
import { runSeed } from '@/lib/seed';
import { getDb } from '@/lib/db/migrate';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { SessionUser } from '@/lib/types';
import type { Locale } from '@/app/worker/dictionaries';
import Link from 'next/link';
import { IconBell, IconFolder, IconCoin } from '@tabler/icons-react';

function ensureSeeded() {
  try {
    const db = getDb();
    const count = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
    if (count === 0) runSeed();
  } catch { /* ignore */ }
}

export default async function WorkerDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedWorkerId) redirect('/login');

  ensureSeeded();

  const dict = await getDictionary(lang as Locale);
  const d = dict.dashboard;
  const dn = dict.notifications;
  const dr = dict.review;

  const worker = repo.getWorker(user.linkedWorkerId);
  const hires = repo.listHiresByWorker(user.linkedWorkerId);
  const submissions = repo.listSubmissionsByWorker(user.linkedWorkerId);
  const earnings = repo.listEarningsByWorker(user.linkedWorkerId);
  const totalEarnings = repo.sumEarningsByWorker(user.linkedWorkerId);
  const ratingSummary = workerRatingSummary(user.linkedWorkerId);
  const applications = repo.listApplicationsByWorker(user.linkedWorkerId);
  const unreadNotifications = repo.countUnreadNotifications(user.linkedWorkerId);
  // 書類提出後（active 以降）で、まだ評価していない就労はレビュー対象。
  const reviewableHires = hires.filter(
    (h) => (h.status === 'active' || h.status === 'completed') && !repo.getRating(h.id, 'worker'),
  );

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
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>{d.kicker}</div>
          <h1><ruby>{d.title}<rt>{lang === 'ja' ? 'しごと' : ''}</rt></ruby></h1>
          {worker && <p>{worker.nameRoman} / {worker.nationality} / 在留期限 {worker.residenceUntil}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <Link
            href={`/worker/${lang}/notifications`}
            aria-label={dn.bell}
            style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,.16)',
              color: '#fff', fontSize: '1.2rem', textDecoration: 'none', marginBottom: '.5rem',
            }}
          >
            <IconBell size={22} stroke={1.75} aria-hidden />
            {unreadNotifications > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, padding: '0 4px',
                borderRadius: 999, background: 'var(--tw-coral, #f97316)', color: '#fff',
                fontSize: '.68rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadNotifications}
              </span>
            )}
          </Link>
          <div style={{ fontSize: '.78rem', opacity: .75, fontWeight: 700 }}>{d.your_rating}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {ratingSummary.count > 0 ? `${ratingSummary.averageStars.toFixed(1)} ★` : '—'}
          </div>
          <div style={{ fontSize: '.78rem', opacity: .75 }}>{ratingSummary.count}{d.ratings_count}</div>
        </div>
      </div>

      {reviewableHires.length > 0 && (
        <Link href={`/worker/${lang}/rate`} className="tw-soft-panel" style={{ display: 'block', textDecoration: 'none' }}>
          <div className="tw-row">
            <span className="tw-avatar">★</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>{dr.banner_title}</div>
              <div style={{ color: 'var(--tw-muted)', fontSize: '.88rem' }}>{dr.banner_desc}</div>
            </div>
            <span className="tw-chip" style={{ background: 'var(--tw-primary)', color: '#fff' }}>{dr.cta}</span>
          </div>
        </Link>
      )}

      <div className="stat-grid">
        <Link href={`/worker/${lang}/applications?status=applied`} className="stat-card blue" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="stat-label">{d.stats.pending_apps}</div>
          <div className="stat-value">{applications.filter(a => a.status === 'applied').length}</div>
        </Link>
        <Link href={`/worker/${lang}/applications?status=accepted`} className="stat-card navy" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <div className="stat-label">{d.stats.accepted}</div>
          <div className="stat-value">{applications.filter(a => a.status === 'accepted').length}</div>
        </Link>
        <div className="stat-card green">
          <div className="stat-label">{d.stats.documents}</div>
          <div className="stat-value">{submissions.length}</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-label">{d.stats.total_earnings}</div>
          <div className="stat-value">¥{totalEarnings.toLocaleString()}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">{d.stats.avg_rating}</div>
          <div className="stat-value">
            {ratingSummary.count > 0 ? `${ratingSummary.averageStars.toFixed(1)}★` : '—'}
          </div>
          <div className="stat-sub">{ratingSummary.count}{d.stats.ratings_count}</div>
        </div>
      </div>

      {worker && (
        <div className="card">
          <div className="tw-row-between" style={{ alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <div className="tw-kicker">{d.residence.kicker}</div>
              <h2 style={{ marginTop: '.15rem' }}>{worker.residenceStatus}</h2>
            </div>
            <span className={`tw-chip ${worker.hasActivityPermit || worker.residenceStatus === '特定活動' ? '' : 'tw-chip-coral'}`}>
              {worker.hasActivityPermit || worker.residenceStatus === '特定活動' ? d.residence.work_permit : d.residence.no_permit}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '.78rem', color: 'var(--tw-muted)', fontWeight: 800 }}>{d.residence.weekly_hours}</div>
              <div className="tw-row-between" style={{ margin: '.25rem 0 .45rem' }}>
                <strong>{weeklyUsed} / {weeklyCap}h</strong>
                <span style={{ color: weeklyUsed > weeklyCap ? 'var(--tw-coral)' : 'var(--tw-primary-dark)', fontWeight: 800 }}>
                  {weeklyUsed > weeklyCap ? d.residence.over : d.residence.ok}
                </span>
              </div>
              <div className="tw-progress"><span style={{ width: `${weeklyPct}%`, background: weeklyUsed > weeklyCap ? 'var(--tw-coral)' : 'var(--tw-primary)' }} /></div>
            </div>
            <div><span style={{ color: 'var(--tw-muted)' }}>{d.residence.card_no}</span><br /><strong>{worker.residenceCardNo}</strong></div>
            <div><span style={{ color: 'var(--tw-muted)' }}>{d.residence.completed_jobs}</span><br /><strong>{completedHires.length}{d.residence.count}</strong></div>
            <div><span style={{ color: 'var(--tw-muted)' }}>{d.residence.upcoming_jobs}</span><br /><strong>{activeHires.length}{d.residence.count}</strong></div>
          </div>
        </div>
      )}

      <div className="card-grid">
        <div className="card">
          <div className="card-title"><IconFolder size={18} stroke={1.75} aria-hidden />{d.recent_docs.title}</div>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted">{d.recent_docs.empty}</p>
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
          <Link href={`/worker/${lang}/documents`} className="btn btn-secondary btn-sm mt-sm">{d.recent_docs.view_all}</Link>
        </div>

        <div className="card">
          <div className="card-title"><IconCoin size={18} stroke={1.75} aria-hidden />{d.recent_earnings.title}</div>
          {earnings.length === 0 ? (
            <p className="text-sm text-muted">{d.recent_earnings.empty}</p>
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
          <Link href={`/worker/${lang}/earnings`} className="btn btn-secondary btn-sm mt-sm">{d.recent_earnings.view_all}</Link>
        </div>
      </div>

      <div className="card mt-lg">
        <div className="card-title">{d.actions.title}</div>
        <div className="tw-actions">
          <Link href={`/worker/${lang}/jobs`} className="btn btn-primary">{d.actions.find_job}</Link>
          <Link href={`/worker/${lang}/documents`} className="btn btn-secondary">{d.actions.documents}</Link>
          <Link href={`/worker/${lang}/earnings`} className="btn btn-secondary">{d.actions.mypage}</Link>
          <Link href={`/worker/${lang}/rate`} className="btn btn-secondary">{d.actions.rate}</Link>
        </div>
      </div>
    </div>
  );
}

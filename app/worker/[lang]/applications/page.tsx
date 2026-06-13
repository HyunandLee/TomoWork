import { auth } from '@/lib/auth/options';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { repo } from '@/lib/db/repo';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { SessionUser, Application } from '@/lib/types';
import type { Locale } from '@/app/worker/dictionaries';

type Tab = 'all' | 'applied' | 'accepted' | 'rejected';
const TABS: Tab[] = ['all', 'applied', 'accepted', 'rejected'];

function badgeClass(status: Application['status']): string {
  if (status === 'accepted') return 'badge-green';
  if (status === 'rejected') return 'badge-red';
  return 'badge-blue';
}

export default async function WorkerApplicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedWorkerId) redirect('/login');

  const dict = await getDictionary(lang as Locale);
  const d = dict.applications;

  const { status } = await searchParams;
  const activeTab: Tab = TABS.includes(status as Tab) ? (status as Tab) : 'all';

  const applications = repo.listApplicationsByWorker(user.linkedWorkerId);
  const filtered = activeTab === 'all'
    ? applications
    : applications.filter((a) => a.status === activeTab);

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>{d.kicker}</div>
          <h1>{d.title}</h1>
          <p>{d.description}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.78rem', opacity: .75, fontWeight: 700 }}>{d.tabs.applied}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>
            {applications.filter((a) => a.status === 'applied').length}
          </div>
        </div>
      </div>

      <div className="tw-chip-list" style={{ marginBottom: '1rem' }}>
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={`/worker/${lang}/applications?status=${tab}`}
            className={`tw-chip ${activeTab === tab ? '' : 'tw-chip-plain'}`}
            style={activeTab === tab ? { background: 'var(--tw-primary)', color: '#fff' } : undefined}
          >
            {d.tabs[tab]}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🗂️</div>
          <h3>{d.empty}</h3>
          <Link href={`/worker/${lang}/jobs`} className="btn btn-secondary btn-sm mt-sm">{d.back}</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {filtered.map((app) => {
            const job = repo.getJob(app.jobId);
            const employer = job ? repo.getEmployer(job.employerId) : undefined;
            return (
              <div key={app.id} className="card">
                <div className="tw-row-between" style={{ alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800 }}>{job?.title ?? app.jobId}</div>
                    <div style={{ color: 'var(--tw-muted)', fontSize: '.85rem', fontWeight: 700 }}>
                      {employer?.officeName ?? dict.jobs.card.default_employer} ・ {job?.location ?? '—'}
                    </div>
                  </div>
                  <span className={`badge ${badgeClass(app.status)}`}>{d.status[app.status]}</span>
                </div>
                <div className="tw-chip-list" style={{ marginTop: '.6rem' }}>
                  {job && <span className="tw-chip tw-chip-plain">{job.jobCategory}</span>}
                  {job && <span className="tw-chip tw-chip-plain">{d.weekly_hours} {job.weeklyHours}h</span>}
                  {job && <span className="tw-chip tw-chip-coral">{d.hourly_wage} ¥{job.hourlyWage.toLocaleString()}</span>}
                </div>
                <div style={{ color: 'var(--tw-muted)', fontSize: '.78rem', marginTop: '.5rem' }}>
                  {d.applied_on}{app.createdAt.slice(0, 10)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { auth } from '@/lib/auth/options';
import { redirect, notFound } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { SessionUser } from '@/lib/types';
import type { Locale } from '@/app/worker/dictionaries';
import { IconFileText } from '@tabler/icons-react';

export default async function WorkerDocumentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedWorkerId) redirect('/login');

  const dict = await getDictionary(lang as Locale);
  const d = dict.documents;

  const submissions = repo.listSubmissionsByWorker(user.linkedWorkerId);

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>{d.kicker}</div>
          <h1>{d.title}</h1>
          <p>{d.description}</p>
        </div>
        <span className="tw-chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{submissions.length}{d.count_suffix}</span>
      </div>

      <div className="tw-soft-panel">
        <div className="tw-row">
          <span className="tw-avatar">守</span>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>{d.auto.title}</div>
            <div style={{ color: 'var(--tw-muted)', fontSize: '.88rem' }}>{d.auto.desc}</div>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><IconFileText size={48} stroke={1.5} aria-hidden /></div>
          <h3>{d.empty.title}</h3>
          <p>{d.empty.desc}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {submissions.map(s => (
            <div key={s.id} className="card">
              <div className="tw-row-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <div className="tw-kicker">{d.card.form_type}</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', marginBottom: '.25rem' }}>{s.receiptNo}</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--tw-muted)' }}>
                    {d.card.submitted_to}{s.employerId} / {d.card.submitted_on}{s.createdAt.slice(0, 10)}
                  </div>
                </div>
                <div className="tw-chip-list">
                  <span className="tw-chip">
                    {s.formId === 'shiki3' ? d.card.default_form : s.formId}
                  </span>
                  <span className="tw-chip tw-chip-plain">{s.status}</span>
                </div>
              </div>
              {s.payload && (
                <details style={{ marginTop: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '.875rem', color: 'var(--blue)', fontWeight: 600 }}>
                    {d.card.view_content}
                  </summary>
                  <div className="shiki3-doc" style={{ marginTop: '.75rem' }}>
                    <div className="shiki3-title">{(s.payload as { titleJa?: string }).titleJa ?? d.card.default_form}</div>
                    <table className="shiki3-table">
                      <tbody>
                        {((s.payload as { fields?: Array<{ key: string; labelJa: string; value: string }> }).fields ?? []).map(f => (
                          <tr key={f.key}>
                            <th>{f.labelJa}</th>
                            <td>{f.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { auth } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import type { SessionUser } from '@/lib/types';

export default async function WorkerDocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedWorkerId) redirect('/login');

  const submissions = repo.listSubmissionsByWorker(user.linkedWorkerId);

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>Documents</div>
          <h1><ruby>書類<rt>しょるい</rt></ruby></h1>
          <p>ハローワークに出した書類を確認できます。</p>
        </div>
        <span className="tw-chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{submissions.length}件</span>
      </div>

      <div className="tw-soft-panel">
        <div className="tw-row">
          <span className="tw-avatar">守</span>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>書類はアプリが自動作成</div>
            <div style={{ color: 'var(--tw-muted)', fontSize: '.88rem' }}>あなたは在留カード情報を確認するだけ。むずかしい手続きは雇用主とアプリで進めます。</div>
          </div>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📄</div>
          <h3>書類がありません</h3>
          <p>雇用主があなたについて書類を提出すると、ここに表示されます</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {submissions.map(s => (
            <div key={s.id} className="card">
              <div className="tw-row-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <div className="tw-kicker">外国人雇用状況届出書</div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', marginBottom: '.25rem' }}>{s.receiptNo}</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--tw-muted)' }}>
                    提出先: {s.employerId} / 提出日: {s.createdAt.slice(0, 10)}
                  </div>
                </div>
                <div className="tw-chip-list">
                  <span className="tw-chip">
                    {s.formId === 'shiki3' ? '様式第3号' : s.formId}
                  </span>
                  <span className="tw-chip tw-chip-plain">{s.status}</span>
                </div>
              </div>
              {s.payload && (
                <details style={{ marginTop: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontSize: '.875rem', color: 'var(--blue)', fontWeight: 600 }}>
                    書類の内容を見る
                  </summary>
                  <div className="shiki3-doc" style={{ marginTop: '.75rem' }}>
                    <div className="shiki3-title">{(s.payload as { titleJa?: string }).titleJa ?? '様式第3号'}</div>
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

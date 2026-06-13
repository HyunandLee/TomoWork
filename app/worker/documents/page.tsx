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
    <div className="page-body">
      <div className="page-header">
        <h1>📄 自分の書類</h1>
        <p>あなたについて提出された外国人雇用状況届出書（様式第3号）の一覧です</p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontFamily: 'monospace', marginBottom: '.25rem' }}>{s.receiptNo}</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--gray-500)' }}>
                    提出先: {s.employerId} / 提出日: {s.createdAt.slice(0, 10)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                  <span className={`badge ${s.formId === 'shiki3' ? 'badge-blue' : 'badge-gray'}`}>
                    {s.formId === 'shiki3' ? '様式第3号' : s.formId}
                  </span>
                  <span className="badge badge-green">{s.status}</span>
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

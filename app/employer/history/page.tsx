import { auth } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import type { SessionUser } from '@/lib/types';
import { IconFolder } from '@tabler/icons-react';

export default async function EmployerHistoryPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedEmployerId) redirect('/login');

  const submissions = repo.listSubmissionsByEmployer(user.linkedEmployerId);

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>Submissions</div>
          <h1>届出履歴</h1>
          <p>提出した外国人雇用状況届出書の一覧です。</p>
        </div>
        <span className="tw-chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{submissions.length}件</span>
      </div>

      {submissions.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><IconFolder size={48} stroke={1.5} aria-hidden /></div>
          <h3>届出がありません</h3>
          <p>書類生成・提出を行うとここに表示されます</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-title">ハローワーク提出履歴</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>受付番号</th>
                  <th>様式</th>
                  <th>労働者ID</th>
                  <th>提出日時</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.receiptNo}</td>
                    <td><span className="badge badge-blue">{s.formId === 'shiki3' ? '様式第3号' : s.formId}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{s.workerId}</td>
                    <td style={{ fontSize: '.82rem' }}>{s.createdAt.slice(0, 19).replace('T', ' ')}</td>
                    <td><span className="badge badge-green">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

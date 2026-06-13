import { auth } from '@/lib/auth/options';
import { redirect } from 'next/navigation';
import { repo } from '@/lib/db/repo';
import { runSeed } from '@/lib/seed';
import { getDb } from '@/lib/db/migrate';
import type { SessionUser } from '@/lib/types';
import AdminClient from './AdminClient';

function ensureSeeded() {
  try {
    const db = getDb();
    const count = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
    if (count === 0) runSeed();
  } catch { /* ignore */ }
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (user.role !== 'admin') redirect('/login');

  ensureSeeded();

  const submissions = repo.listAllSubmissions();
  const workers = repo.listWorkers();

  return (
    <div className="page-body">
      <div className="page-header">
        <h1>⚙️ 管理画面</h1>
        <p>全届出一覧・シードリセット（開発用）</p>
      </div>

      <AdminClient />

      <div className="card mt-lg">
        <div className="card-title">📋 全届出一覧 ({submissions.length}件)</div>
        {submissions.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p className="text-muted">届出がありません</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>受付番号</th>
                  <th>様式</th>
                  <th>労働者ID</th>
                  <th>事業所ID</th>
                  <th>提出日時</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '.82rem' }}>{s.receiptNo}</td>
                    <td><span className="badge badge-blue">{s.formId === 'shiki3' ? '様式第3号' : s.formId}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '.78rem' }}>{s.workerId}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '.78rem' }}>{s.employerId}</td>
                    <td style={{ fontSize: '.82rem' }}>{s.createdAt.slice(0, 19).replace('T', ' ')}</td>
                    <td><span className="badge badge-green">{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card mt-lg">
        <div className="card-title">👥 全ワーカー一覧 ({workers.length}人)</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>氏名（ローマ字）</th>
                <th>国籍</th>
                <th>在留資格</th>
                <th>在留期限</th>
                <th>活動許可</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(w => {
                const isExpired = w.residenceUntil < new Date().toISOString().slice(0, 10);
                return (
                  <tr key={w.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '.78rem' }}>{w.id}</td>
                    <td style={{ fontWeight: 600 }}>{w.nameRoman}</td>
                    <td>{w.nationality}</td>
                    <td><span className="badge badge-blue">{w.residenceStatus}</span></td>
                    <td style={{ color: isExpired ? 'var(--red)' : undefined }}>
                      {w.residenceUntil}
                      {isExpired && <span className="badge badge-red" style={{ marginLeft: '.375rem' }}>期限切れ</span>}
                    </td>
                    <td>
                      <span className={`badge ${w.hasActivityPermit ? 'badge-green' : 'badge-gray'}`}>
                        {w.hasActivityPermit ? '有' : '無'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import type { Application } from '@/lib/types';

interface ApplicationWithDetails extends Application {
  workerName?: string;
  jobTitle?: string;
  jobCategory?: string;
  weeklyHours?: number;
}

export default function EmployerApplicantsPage() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/applications').then(r => r.json()),
    ]).then(([appsRes]) => {
      if (appsRes.ok) setApplications(appsRes.data);
      setLoading(false);
    });
  }, []);

  async function handleAccept(appId: string) {
    setAccepting(appId);
    const res = await fetch(`/api/applications/${appId}/accept`, { method: 'POST' });
    const data = await res.json();
    setAccepting(null);
    if (data.ok) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'accepted' } : a));
      setMsg(`採用しました！hire ID: ${data.data.id}`);
      setTimeout(() => setMsg(''), 5000);
    } else {
      setMsg(`エラー: ${data.error}`);
    }
  }

  const grouped = {
    applied: applications.filter(a => a.status === 'applied'),
    accepted: applications.filter(a => a.status === 'accepted'),
    rejected: applications.filter(a => a.status === 'rejected'),
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <h1>👥 応募者一覧</h1>
        <p>求人への応募者を確認し、採用を行います</p>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      {loading ? (
        <div className="text-center"><span className="spinner" /></div>
      ) : applications.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">👥</div>
          <h3>応募者がいません</h3>
          <p>求人に応募が来るとここに表示されます</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {grouped.applied.length > 0 && (
            <div className="card">
              <div className="card-title">📬 未対応の応募 ({grouped.applied.length})</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>労働者ID</th>
                      <th>求人ID</th>
                      <th>応募日</th>
                      <th>アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.applied.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{a.workerId}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{a.jobId}</td>
                        <td style={{ fontSize: '.82rem' }}>{a.createdAt.slice(0, 10)}</td>
                        <td>
                          <button
                            id={`accept-btn-${a.id}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAccept(a.id)}
                            disabled={accepting === a.id}
                          >
                            {accepting === a.id ? <span className="spinner" /> : '✅'}
                            採用する
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {grouped.accepted.length > 0 && (
            <div className="card">
              <div className="card-title">✅ 採用済み ({grouped.accepted.length})</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>労働者ID</th>
                      <th>求人ID</th>
                      <th>採用日</th>
                      <th>書類</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.accepted.map(a => (
                      <tr key={a.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{a.workerId}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{a.jobId}</td>
                        <td style={{ fontSize: '.82rem' }}>{a.createdAt.slice(0, 10)}</td>
                        <td>
                          <a href="/employer/doc" className="btn btn-secondary btn-sm">📄 書類生成</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

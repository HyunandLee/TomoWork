'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Application } from '@/lib/types';
import { IconUsers } from '@tabler/icons-react';

interface ApplicationWithDetails extends Application {
  hireId?: string;
  workerName: string;
  workerNameKana: string;
  workerNationality: string;
  workerResidenceStatus: string;
  jobTitle: string;
  jobCategory: string;
  weeklyHours: number;
  hourlyWage: number;
  location: string;
}

export default function EmployerApplicantsPage() {
  const router = useRouter();
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
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'accepted', hireId: data.data.id } : a));
      setMsg('採用しました。書類生成画面へ移動します。');
      router.push(`/employer/doc?hireId=${data.data.id}`);
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
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>Applicants</div>
          <h1>応募者</h1>
          <p>ワーカーを採用すると、就労イベントが作られ、様式第3号の生成へ進めます。</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.78rem', opacity: .75, fontWeight: 700 }}>未対応</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{grouped.applied.length}</div>
        </div>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      {grouped.applied.length > 0 && (
        <div className="applicant-toast">
          <strong>新しい応募者が {grouped.applied.length} 件あります</strong>
          <small>内容を確認して、条件が合う応募者を採用してください。</small>
        </div>
      )}

      {loading ? (
        <div className="text-center"><span className="spinner" /></div>
      ) : applications.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><IconUsers size={48} stroke={1.5} aria-hidden /></div>
          <h3>応募者がいません</h3>
          <p>求人に応募が来るとここに表示されます</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {grouped.applied.length > 0 && (
            <div className="card">
              <div className="card-title">未対応の応募 ({grouped.applied.length})</div>
              <div className="tw-card-grid">
                {grouped.applied.map(a => (
                  <div key={a.id} className="tw-soft-panel">
                    <div className="tw-row-between" style={{ alignItems: 'flex-start', marginBottom: '.85rem' }}>
                      <div className="tw-row">
                        <span className="tw-avatar">人</span>
                        <div>
                          <div style={{ fontWeight: 800 }}>{a.workerName ?? a.workerId}</div>
                          <div style={{ color: 'var(--tw-muted)', fontSize: '.82rem', fontWeight: 700 }}>{a.workerNameKana} ・ 応募日 {a.createdAt.slice(0, 10)}</div>
                        </div>
                      </div>
                      <span className="tw-stars">★ 4.8</span>
                    </div>
                    <div className="tw-chip-list" style={{ marginBottom: '1rem' }}>
                      <span className="tw-chip">求人 {a.jobTitle ?? a.jobId}</span>
                      <span className="tw-chip tw-chip-plain">週{a.weeklyHours}h</span>
                      <span className="tw-chip tw-chip-coral">{a.jobCategory}</span>
                      <span className="tw-chip tw-chip-plain">時給 ¥{a.hourlyWage.toLocaleString()}</span>
                    </div>
                    <div style={{ color: 'var(--tw-muted)', fontSize: '.84rem', fontWeight: 700, marginBottom: '1rem' }}>
                      {a.workerNationality} / {a.workerResidenceStatus} / {a.location}
                    </div>
                    <button
                      id={`accept-btn-${a.id}`}
                      className="btn btn-primary btn-sm w-full"
                      style={{ justifyContent: 'center' }}
                      onClick={() => handleAccept(a.id)}
                      disabled={accepting === a.id}
                    >
                      {accepting === a.id ? <span className="spinner" /> : null}
                      採用して書類生成へ
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {grouped.accepted.length > 0 && (
            <div className="card">
              <div className="card-title">採用済み ({grouped.accepted.length})</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>労働者</th>
                      <th>求人</th>
                      <th>条件</th>
                      <th>採用日</th>
                      <th>書類</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped.accepted.map(a => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ fontWeight: 800 }}>{a.workerName}</div>
                          <div style={{ color: 'var(--tw-muted)', fontSize: '.78rem', fontWeight: 700 }}>{a.workerNameKana}</div>
                        </td>
                        <td>{a.jobTitle}</td>
                        <td style={{ fontSize: '.82rem' }}>週{a.weeklyHours}h / ¥{a.hourlyWage.toLocaleString()}</td>
                        <td style={{ fontSize: '.82rem' }}>{a.createdAt.slice(0, 10)}</td>
                        <td>
                          <a href={a.hireId ? `/employer/doc?hireId=${a.hireId}` : '/employer/doc'} className="btn btn-secondary btn-sm">書類生成</a>
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

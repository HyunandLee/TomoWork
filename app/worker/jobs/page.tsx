'use client';
import { useState, useEffect } from 'react';
import type { JobPosting, Application } from '@/lib/types';

export default function WorkerJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [myApps, setMyApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/jobs').then(r => r.json()),
      fetch('/api/applications').then(r => r.json()),
    ]).then(([jobsRes, appsRes]) => {
      if (jobsRes.ok) setJobs(jobsRes.data);
      if (appsRes.ok) setMyApps(appsRes.data);
      setLoading(false);
    });
  }, []);

  const appliedJobIds = new Set(myApps.map(a => a.jobId));

  async function handleApply(jobId: string) {
    setApplying(jobId);
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
    const data = await res.json();
    setApplying(null);
    if (data.ok) {
      setMyApps(prev => [...prev, data.data]);
      setMsg('応募しました！雇用主の採用を待ちましょう');
      setTimeout(() => setMsg(''), 4000);
    } else {
      setMsg(`エラー: ${data.error}`);
    }
  }

  return (
    <div className="page-body">
      <div className="page-header">
        <h1>🔍 バイト先を探す</h1>
        <p>公開中の求人を確認し、気に入ったら応募しましょう</p>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      <div className="banner banner-info mb">
        <span className="banner-icon">ℹ️</span>
        <div>
          <div className="banner-title">週労働時間に注意</div>
          <div>留学・家族滞在の方は週28時間が上限です。複数掛け持ちの場合は合算で判定されます。</div>
        </div>
      </div>

      {loading ? (
        <div className="text-center"><span className="spinner" /></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🔍</div>
          <h3>公開中の求人がありません</h3>
        </div>
      ) : (
        <div className="card-grid">
          {jobs.map(j => {
            const isApplied = appliedJobIds.has(j.id);
            const app = myApps.find(a => a.jobId === j.id);
            return (
              <div key={j.id} className="job-card">
                <div className="job-card-title">{j.title}</div>
                <div className="job-card-meta">
                  <span>🏢 {j.location}</span>
                  <span>⏰ 週{j.weeklyHours}h</span>
                  <span>💴 ¥{j.hourlyWage.toLocaleString()}/h</span>
                </div>
                <div style={{ marginBottom: '.75rem' }}>
                  <span className="badge badge-blue">{j.jobCategory}</span>
                  {j.weeklyHours > 28 && (
                    <span className="badge badge-yellow" style={{ marginLeft: '.375rem' }}>⚠️ 留学超過</span>
                  )}
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--gray-400)', marginBottom: '.875rem' }}>
                  週{j.weeklyHours}h × ¥{j.hourlyWage.toLocaleString()} ≒ 月¥{Math.round(j.weeklyHours * j.hourlyWage * 4.3).toLocaleString()}
                </div>
                {!isApplied ? (
                  <button
                    id={`apply-btn-${j.id}`}
                    className="btn btn-primary btn-sm w-full"
                    style={{ justifyContent: 'center' }}
                    onClick={() => handleApply(j.id)}
                    disabled={applying === j.id}
                  >
                    {applying === j.id ? <span className="spinner" /> : '📩'}
                    応募する
                  </button>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <span className={`badge ${app?.status === 'accepted' ? 'badge-green' : 'badge-blue'}`}>
                      {app?.status === 'accepted' ? '✅ 採用済み' : app?.status === 'rejected' ? '❌ 不採用' : '📬 応募中'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

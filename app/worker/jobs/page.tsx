'use client';
import { useState, useEffect } from 'react';
import type { JobPosting, Application } from '@/lib/types';

type JobCard = JobPosting & {
  employerName?: string;
};

export default function WorkerJobsPage() {
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [myApps, setMyApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('すべて');
  const [q, setQ] = useState('');

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
  const categories = ['すべて', ...Array.from(new Set(jobs.map(j => j.jobCategory)))];
  const filteredJobs = jobs.filter(j => {
    const text = `${j.title} ${j.jobCategory} ${j.location} ${j.employerName ?? ''}`;
    return (filter === 'すべて' || j.jobCategory === filter) && text.toLowerCase().includes(q.toLowerCase());
  });

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
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>Worker App</div>
          <h1><ruby>仕事<rt>しごと</rt></ruby>を さがす</h1>
          <p>やさしい日本語で内容を確認して、はたらきたいバイト先を選べます。</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.78rem', opacity: .75, fontWeight: 700 }}>応募中</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{myApps.filter(a => a.status === 'applied').length}</div>
        </div>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      <div className="tw-soft-panel">
        <div className="tw-row">
          <span className="tw-avatar">守</span>
        <div>
            <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>週労働時間に注意</div>
            <div style={{ fontSize: '.9rem', color: 'var(--tw-muted)' }}>留学・家族滞在の方は週28時間が上限です。複数の仕事をするときも合算されます。</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">しごと・場所でさがす</label>
            <input
              className="form-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="例：カフェ、渋谷、配送"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">カテゴリ</label>
            <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)}>
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
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
        <div className="tw-card-grid">
          {filteredJobs.map(j => {
            const isApplied = appliedJobIds.has(j.id);
            const app = myApps.find(a => a.jobId === j.id);
            const monthEstimate = Math.round(j.weeklyHours * j.hourlyWage * 4.3);
            const hoursPct = Math.min(100, Math.round(j.weeklyHours / 28 * 100));
            return (
              <div key={j.id} className="card tw-job-card">
                <div className="tw-job-art">
                  {j.employerName ?? '募集企業'} / {j.jobCategory}
                </div>
                <div className="tw-job-body">
                  <div className="tw-row-between" style={{ marginBottom: '.6rem' }}>
                    <div className="tw-row" style={{ minWidth: 0 }}>
                      <span className="tw-avatar">仕</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="job-card-title">{j.title}</div>
                        <div style={{ fontSize: '.82rem', color: 'var(--tw-muted)', fontWeight: 700 }}>{j.employerName ?? '募集企業'} ・ {j.location}</div>
                      </div>
                    </div>
                    <span className="tw-stars">★ 4.8</span>
                  </div>
                  <div className="tw-chip-list" style={{ marginBottom: '.85rem' }}>
                    <span className="tw-chip">{j.jobCategory}</span>
                    <span className="tw-chip tw-chip-plain">週{j.weeklyHours}h</span>
                    <span className="tw-chip tw-chip-coral">¥{j.hourlyWage.toLocaleString()}/h</span>
                    {j.weeklyHours > 28 && <span className="tw-chip tw-chip-coral">上限確認</span>}
                  </div>
                  <div style={{ marginBottom: '.9rem' }}>
                    <div className="tw-row-between" style={{ fontSize: '.78rem', fontWeight: 800, color: j.weeklyHours > 28 ? 'var(--tw-coral)' : 'var(--tw-primary-dark)', marginBottom: '.35rem' }}>
                      <span>週の時間</span>
                      <span>{j.weeklyHours} / 28h</span>
                    </div>
                    <div className="tw-progress"><span style={{ width: `${hoursPct}%`, background: j.weeklyHours > 28 ? 'var(--tw-coral)' : 'var(--tw-primary)' }} /></div>
                  </div>
                  <div className="tw-row-between" style={{ marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '.75rem', color: 'var(--tw-muted)', fontWeight: 800 }}>月のめやす</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>¥{monthEstimate.toLocaleString()}</div>
                    </div>
                    <span className="tw-chip tw-chip-plain">書類は自動作成</span>
                  </div>
                  {!isApplied ? (
                    <button
                      id={`apply-btn-${j.id}`}
                      className="btn btn-primary btn-sm w-full"
                      style={{ justifyContent: 'center' }}
                      onClick={() => handleApply(j.id)}
                      disabled={applying === j.id}
                    >
                      {applying === j.id ? <span className="spinner" /> : null}
                      この仕事に応募する
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <span className={`badge ${app?.status === 'accepted' ? 'badge-green' : 'badge-blue'}`}>
                        {app?.status === 'accepted' ? '採用済み' : app?.status === 'rejected' ? '不採用' : '応募中'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

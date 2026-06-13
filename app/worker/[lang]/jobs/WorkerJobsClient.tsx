'use client';
import { useState, useEffect } from 'react';
import type { JobPosting, Application } from '@/lib/types';
import type { Dictionary } from '@/app/worker/dictionaries';

type JobCard = JobPosting & { employerName?: string };

type Props = {
  d: Dictionary['jobs'];
};

export default function WorkerJobsClient({ d }: Props) {
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [myApps, setMyApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('');
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

  const all = d.category.all;
  const appliedJobIds = new Set(myApps.map(a => a.jobId));
  const categories = [all, ...Array.from(new Set(jobs.map(j => j.jobCategory)))];
  const activeFilter = filter || all;
  const filteredJobs = jobs.filter(j => {
    const text = `${j.title} ${j.jobCategory} ${j.location} ${j.employerName ?? ''}`;
    return (activeFilter === all || j.jobCategory === activeFilter) && text.toLowerCase().includes(q.toLowerCase());
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
      setMsg(d.messages.apply_success);
      setTimeout(() => setMsg(''), 4000);
    } else {
      setMsg(`${d.messages.error_prefix}${data.error}`);
    }
  }

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>{d.kicker}</div>
          <h1>{d.title}</h1>
          <p>{d.description}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '.78rem', opacity: .75, fontWeight: 700 }}>{d.pending}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{myApps.filter(a => a.status === 'applied').length}</div>
        </div>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      <div className="tw-soft-panel">
        <div className="tw-row">
          <span className="tw-avatar">守</span>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>{d.warning.title}</div>
            <div style={{ fontSize: '.9rem', color: 'var(--tw-muted)' }}>{d.warning.desc}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{d.search.label}</label>
            <input
              className="form-input"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={d.search.placeholder}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{d.category.label}</label>
            <select className="form-select" value={activeFilter} onChange={e => setFilter(e.target.value)}>
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
          <h3>{d.empty}</h3>
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
                  {j.employerName ?? d.card.default_employer} / {j.jobCategory}
                </div>
                <div className="tw-job-body">
                  <div className="tw-row-between" style={{ marginBottom: '.6rem' }}>
                    <div className="tw-row" style={{ minWidth: 0 }}>
                      <span className="tw-avatar">仕</span>
                      <div style={{ minWidth: 0 }}>
                        <div className="job-card-title">{j.title}</div>
                        <div style={{ fontSize: '.82rem', color: 'var(--tw-muted)', fontWeight: 700 }}>{j.employerName ?? d.card.default_employer} ・ {j.location}</div>
                      </div>
                    </div>
                    <span className="tw-stars">★ 4.8</span>
                  </div>
                  <div className="tw-chip-list" style={{ marginBottom: '.85rem' }}>
                    <span className="tw-chip">{j.jobCategory}</span>
                    <span className="tw-chip tw-chip-plain">週{j.weeklyHours}h</span>
                    <span className="tw-chip tw-chip-coral">¥{j.hourlyWage.toLocaleString()}/h</span>
                    {j.weeklyHours > 28 && <span className="tw-chip tw-chip-coral">{d.card.hours_cap_warning}</span>}
                  </div>
                  <div style={{ marginBottom: '.9rem' }}>
                    <div className="tw-row-between" style={{ fontSize: '.78rem', fontWeight: 800, color: j.weeklyHours > 28 ? 'var(--tw-coral)' : 'var(--tw-primary-dark)', marginBottom: '.35rem' }}>
                      <span>{d.card.weekly_hours}</span>
                      <span>{j.weeklyHours} / 28h</span>
                    </div>
                    <div className="tw-progress"><span style={{ width: `${hoursPct}%`, background: j.weeklyHours > 28 ? 'var(--tw-coral)' : 'var(--tw-primary)' }} /></div>
                  </div>
                  <div className="tw-row-between" style={{ marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '.75rem', color: 'var(--tw-muted)', fontWeight: 800 }}>{d.card.monthly_estimate}</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>¥{monthEstimate.toLocaleString()}</div>
                    </div>
                    <span className="tw-chip tw-chip-plain">{d.card.auto_docs}</span>
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
                      {d.card.apply}
                    </button>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <span className={`badge ${app?.status === 'accepted' ? 'badge-green' : 'badge-blue'}`}>
                        {app?.status === 'accepted' ? d.status.accepted : app?.status === 'rejected' ? d.status.rejected : d.status.applied}
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

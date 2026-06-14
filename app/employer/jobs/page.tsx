'use client';
import { useState, useEffect } from 'react';
import type { JobPosting } from '@/lib/types';
import { IconClipboardList } from '@tabler/icons-react';

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    jobCategory: '',
    weeklyHours: 20,
    hourlyWage: 1100,
    location: '',
  });

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(d => {
      if (d.ok) setJobs(d.data);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, weeklyHours: Number(form.weeklyHours), hourlyWage: Number(form.hourlyWage) }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.ok) {
      setJobs(prev => [data.data, ...prev]);
      setShowForm(false);
      setForm({ title: '', jobCategory: '', weeklyHours: 20, hourlyWage: 1100, location: '' });
      setMsg('求人を投稿しました！');
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg(data.error);
    }
  }

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>Job Postings</div>
          <h1>求人</h1>
          <p>かんたん入力で公開し、応募から採用、書類生成までつなげます。</p>
        </div>
        <button id="post-job-btn" className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ background: '#fff', color: 'var(--tw-primary-dark)' }}>
          ＋ 求人を作る
        </button>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      {showForm && (
        <div className="card">
          <div className="card-title">新しい求人を作る</div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">求人タイトル</label>
                <input id="job-title" className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="例：カフェ ホールスタッフ" required />
              </div>
              <div className="form-group">
                <label className="form-label">業務カテゴリ</label>
                <select id="job-category" className="form-select" value={form.jobCategory} onChange={e => setForm({...form, jobCategory: e.target.value})} required>
                  <option value="">選択してください</option>
                  <option>飲食店</option>
                  <option>小売</option>
                  <option>配送</option>
                  <option>事務</option>
                  <option>IT・エンジニア</option>
                  <option>製造</option>
                  <option>清掃</option>
                  <option>ホテル</option>
                  <option>農業</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">週所定労働時間（時間）</label>
                <input id="job-weekly-hours" type="number" className="form-input" value={form.weeklyHours} onChange={e => setForm({...form, weeklyHours: Number(e.target.value)})} min={1} max={60} required />
                <div className="form-hint">留学・家族滞在は週28h以内</div>
              </div>
              <div className="form-group">
                <label className="form-label">時給（円）</label>
                <input id="job-hourly-wage" type="number" className="form-input" value={form.hourlyWage} onChange={e => setForm({...form, hourlyWage: Number(e.target.value)})} min={900} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">勤務地</label>
              <input id="job-location" className="form-input" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="例：東京都渋谷区" required />
            </div>
            <div className="flex gap-sm">
              <button id="job-submit-btn" type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : null}
                公開する
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>キャンセル</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center mt-lg"><span className="spinner" /></div>
      ) : jobs.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><IconClipboardList size={48} stroke={1.5} aria-hidden /></div>
          <h3>求人がありません</h3>
          <p>「求人を投稿」ボタンから最初の求人を作成しましょう</p>
        </div>
      ) : (
        <div className="tw-card-grid">
          {jobs.map(j => {
            const pct = Math.min(100, Math.round((j.weeklyHours / 28) * 100));
            return (
              <div key={j.id} className="card">
                <div className="tw-row-between" style={{ alignItems: 'flex-start', marginBottom: '.85rem' }}>
                  <div>
                    <div className="job-card-title">{j.title}</div>
                    <div style={{ color: 'var(--tw-muted)', fontSize: '.86rem', fontWeight: 700 }}>{j.location}</div>
                  </div>
                  <span className={`tw-chip ${j.status === 'open' ? '' : 'tw-chip-plain'}`}>
                    {j.status === 'open' ? '募集中' : '終了'}
                  </span>
                </div>
                <div className="tw-chip-list" style={{ marginBottom: '1rem' }}>
                  <span className="tw-chip">{j.jobCategory}</span>
                  <span className="tw-chip tw-chip-coral">¥{j.hourlyWage.toLocaleString()}/h</span>
                  <span className="tw-chip tw-chip-plain">書類自動作成</span>
                </div>
                <div>
                  <div className="tw-row-between" style={{ fontSize: '.78rem', fontWeight: 800, color: j.weeklyHours > 28 ? 'var(--tw-coral)' : 'var(--tw-primary-dark)', marginBottom: '.35rem' }}>
                    <span>週所定労働時間</span>
                    <span>{j.weeklyHours}h</span>
                  </div>
                  <div className="tw-progress"><span style={{ width: `${pct}%`, background: j.weeklyHours > 28 ? 'var(--tw-coral)' : 'var(--tw-primary)' }} /></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

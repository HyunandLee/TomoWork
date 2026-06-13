'use client';
import { useState, useEffect } from 'react';
import type { JobPosting } from '@/lib/types';

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
    <div className="page-body">
      <div className="page-header flex-between">
        <div>
          <h1>📋 求人管理</h1>
          <p>求人の投稿・管理を行います</p>
        </div>
        <button id="post-job-btn" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          ＋ 求人を投稿
        </button>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      {showForm && (
        <div className="card mb-lg">
          <div className="card-title">📝 求人投稿</div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">求人タイトル</label>
                <input id="job-title" className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="例：カフェスタッフ（ホール）" required />
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
                投稿する
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
          <div className="empty-state-icon">📋</div>
          <h3>求人がありません</h3>
          <p>「求人を投稿」ボタンから最初の求人を作成しましょう</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>タイトル</th>
                  <th>カテゴリ</th>
                  <th>週時間</th>
                  <th>時給</th>
                  <th>勤務地</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j.id}>
                    <td style={{ fontWeight: 600 }}>{j.title}</td>
                    <td>{j.jobCategory}</td>
                    <td>{j.weeklyHours}h</td>
                    <td>¥{j.hourlyWage.toLocaleString()}</td>
                    <td>{j.location}</td>
                    <td>
                      <span className={`badge ${j.status === 'open' ? 'badge-green' : 'badge-gray'}`}>
                        {j.status === 'open' ? '公開中' : 'クローズ'}
                      </span>
                    </td>
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

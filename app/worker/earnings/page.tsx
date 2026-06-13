'use client';
import { useState, useEffect } from 'react';
import type { Earning, HireEvent } from '@/lib/types';

export default function WorkerEarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [total, setTotal] = useState(0);
  const [hires, setHires] = useState<HireEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ hireId: '', amount: 0, workedOn: new Date().toISOString().slice(0, 10) });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/earnings').then(r => r.json()).then(d => {
      if (d.ok) { setEarnings(d.data.items); setTotal(d.data.total); }
      setLoading(false);
    });
  }, []);

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch('/api/earnings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hireId: form.hireId, amount: Number(form.amount), workedOn: form.workedOn }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (data.ok) {
      setEarnings(prev => [data.data, ...prev]);
      setTotal(prev => prev + data.data.amount);
      setShowForm(false);
      setMsg('稼ぎを記録しました！');
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg(`エラー: ${data.error}`);
    }
  }

  return (
    <div className="page-body">
      <div className="page-header flex-between">
        <div>
          <h1>💴 稼ぎ記録</h1>
          <p>就労ごとの稼ぎを記録・管理します</p>
        </div>
        <button id="record-earning-btn" className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          ＋ 稼ぎを記録
        </button>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      <div className="stat-grid mb-lg">
        <div className="stat-card green">
          <div className="stat-label">総稼ぎ額</div>
          <div className="stat-value">¥{total.toLocaleString()}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-label">記録件数</div>
          <div className="stat-value">{earnings.length}</div>
        </div>
      </div>

      {showForm && (
        <div className="card mb-lg">
          <div className="card-title">💰 稼ぎを記録</div>
          <form onSubmit={handleRecord}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">就労ID (Hire ID)</label>
                <input
                  id="earning-hire-id"
                  className="form-input"
                  value={form.hireId}
                  onChange={e => setForm({...form, hireId: e.target.value})}
                  placeholder="例: hire-c001"
                  required
                />
                <div className="form-hint">採用された就労のIDを入力してください</div>
              </div>
              <div className="form-group">
                <label className="form-label">勤務日</label>
                <input
                  id="earning-worked-on"
                  type="date"
                  className="form-input"
                  value={form.workedOn}
                  onChange={e => setForm({...form, workedOn: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">稼ぎ額（円）</label>
              <input
                id="earning-amount"
                type="number"
                className="form-input"
                value={form.amount || ''}
                onChange={e => setForm({...form, amount: Number(e.target.value)})}
                placeholder="例: 22000"
                min={1}
                required
              />
            </div>
            <div className="flex gap-sm">
              <button id="earning-submit-btn" type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <span className="spinner" /> : null}
                記録する
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>キャンセル</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center"><span className="spinner" /></div>
      ) : earnings.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">💴</div>
          <h3>稼ぎ記録がありません</h3>
          <p>「稼ぎを記録」ボタンから追加しましょう</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>勤務日</th>
                  <th>就労ID</th>
                  <th>稼ぎ額</th>
                  <th>記録日時</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.workedOn}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '.82rem' }}>{e.hireId}</td>
                    <td style={{ color: 'var(--green)', fontWeight: 700 }}>¥{e.amount.toLocaleString()}</td>
                    <td style={{ fontSize: '.82rem' }}>{e.createdAt.slice(0, 10)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} style={{ textAlign: 'right', fontWeight: 600, paddingRight: '1rem' }}>合計</td>
                  <td style={{ color: 'var(--green)', fontWeight: 700, fontSize: '1.1rem' }}>¥{total.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

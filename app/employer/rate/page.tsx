'use client';
import { useState } from 'react';

export default function EmployerRatePage() {
  const [stars, setStars] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');

  // 実際の完了済み就労取得（hire/completeのAPIが無いため admin 向けに内部で取得）
  // ここではrating投稿フォームをhire IDベースで表示
  const [hireId, setHireId] = useState('');

  async function handleRate(hireIdToRate: string) {
    const s = stars[hireIdToRate];
    if (!s) { setMsg('星を選択してください'); return; }
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hireId: hireIdToRate, raterRole: 'employer', stars: s, comment: comments[hireIdToRate] }),
    });
    const data = await res.json();
    if (data.ok) {
      setSubmitted(prev => new Set(prev).add(hireIdToRate));
      setMsg('評価を送信しました！');
      setTimeout(() => setMsg(''), 3000);
    } else {
      setMsg(`エラー: ${data.error}`);
    }
  }

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>Mutual Rating</div>
          <h1>労働者を評価する</h1>
          <p>完了済み就労のワーカーに星1〜5で評価します。</p>
        </div>
        <span className="tw-stars" style={{ color: '#fff' }}>★ ★ ★</span>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      <div className="card">
        <div className="card-title">ワーカーはどうでしたか？</div>
        <div className="tw-soft-panel mb">
          <div className="tw-row">
            <span className="tw-avatar">★</span>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>相互評価</div>
              <div style={{ color: 'var(--tw-muted)', fontSize: '.88rem' }}>就労IDを指定して評価します。シード例: <code>hire-c001</code>, <code>hire-c002</code></div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">就労ID (Hire ID)</label>
          <input
            id="rate-hire-id"
            className="form-input"
            value={hireId}
            onChange={e => setHireId(e.target.value)}
            placeholder="例: hire-c001"
          />
        </div>

        {hireId && !submitted.has(hireId) && (
          <>
            <div className="form-group">
              <label className="form-label">星1〜5</label>
              <div className="stars">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    id={`star-${n}`}
                    className={`star ${(stars[hireId] ?? 0) >= n ? 'filled' : ''}`}
                    onClick={() => setStars(prev => ({...prev, [hireId]: n}))}
                    style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">コメント（任意）</label>
              <textarea
                id="rate-comment"
                className="form-textarea"
                value={comments[hireId] ?? ''}
                onChange={e => setComments(prev => ({...prev, [hireId]: e.target.value}))}
                placeholder="労働者への評価コメント..."
              />
            </div>
            <button
              id="submit-rating-btn"
              className="btn btn-primary"
              onClick={() => handleRate(hireId)}
            >
              評価を送信
            </button>
          </>
        )}

        {submitted.has(hireId) && (
          <div className="tw-soft-panel">
            <div className="tw-row">
              <span className="tw-avatar">済</span>
              <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>評価を送信しました（{stars[hireId]}星）</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

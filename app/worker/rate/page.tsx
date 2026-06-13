'use client';
import { useState } from 'react';

export default function WorkerRatePage() {
  const [hireId, setHireId] = useState('');
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (!stars) { setMsg('星を選択してください'); return; }
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hireId, raterRole: 'worker', stars, comment }),
    });
    const data = await res.json();
    if (data.ok) {
      setSubmitted(true);
      setMsg('評価を送信しました！');
    } else {
      setMsg(`エラー: ${data.error}`);
    }
  }

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>Mutual Rating</div>
          <h1><ruby>評価<rt>ひょうか</rt></ruby></h1>
          <p>お店を星1〜5で評価します。おたがいの信頼につながります。</p>
        </div>
        <span className="tw-stars" style={{ color: '#fff' }}>★ ★ ★</span>
      </div>

      {msg && <div className={`alert ${submitted ? 'alert-success' : 'alert-error'} mb`}>{msg}</div>}

      <div className="card">
        <div className="card-title">お店はどうでしたか？</div>
        {!submitted ? (
          <form onSubmit={handleRate}>
            <div className="form-group">
              <label className="form-label">就労ID (Hire ID)</label>
              <input
                id="worker-rate-hire-id"
                className="form-input"
                value={hireId}
                onChange={e => setHireId(e.target.value)}
                placeholder="例: hire-c001"
                required
              />
              <div className="form-hint">シードデータの完了済み就労: <code>hire-c001</code></div>
            </div>

            <div className="form-group">
              <label className="form-label">星1〜5</label>
              <div className="stars">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    type="button"
                    id={`worker-star-${n}`}
                    className={`star ${stars >= n ? 'filled' : ''}`}
                    onClick={() => setStars(n)}
                    style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: stars >= n ? '#f59e0b' : 'var(--gray-300)' }}
                  >
                    ★
                  </button>
                ))}
              </div>
              {stars > 0 && <div className="form-hint">{stars}星を選択中</div>}
            </div>

            <div className="form-group">
              <label className="form-label">コメント（任意）</label>
              <textarea
                id="worker-rate-comment"
                className="form-textarea"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="ていねいに教えてくれた、また働きたい など"
              />
            </div>

            <button
              id="worker-submit-rating-btn"
              type="submit"
              className="btn btn-primary"
            >
              評価を送信
            </button>
          </form>
        ) : (
          <div className="tw-soft-panel">
            <div className="tw-row">
            <span className="tw-avatar">済</span>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>評価を送信しました！</div>
              <div>{stars}★ — ありがとうございます</div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import type { Dictionary } from '@/app/worker/dictionaries';

type Props = {
  d: Dictionary['rate'];
};

export default function WorkerRateClient({ d }: Props) {
  const [hireId, setHireId] = useState('');
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleRate(e: React.FormEvent) {
    e.preventDefault();
    if (!stars) { setMsg(d.errors.select_stars); return; }
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hireId, raterRole: 'worker', stars, comment }),
    });
    const data = await res.json();
    if (data.ok) {
      setSubmitted(true);
      setMsg(d.success.title);
    } else {
      setMsg(`${d.errors.prefix}${data.error}`);
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
        <span className="tw-stars" style={{ color: '#fff' }}>★ ★ ★</span>
      </div>

      {msg && <div className={`alert ${submitted ? 'alert-success' : 'alert-error'} mb`}>{msg}</div>}

      <div className="card">
        <div className="card-title">{d.section_title}</div>
        {!submitted ? (
          <form onSubmit={handleRate}>
            <div className="form-group">
              <label className="form-label">{d.hire_id.label}</label>
              <input
                id="worker-rate-hire-id"
                className="form-input"
                value={hireId}
                onChange={e => setHireId(e.target.value)}
                placeholder={d.hire_id.placeholder}
                required
              />
              <div className="form-hint">{d.hire_id.hint}<code>hire-c001</code></div>
            </div>

            <div className="form-group">
              <label className="form-label">{d.stars.label}</label>
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
              {stars > 0 && <div className="form-hint">{d.stars.selected.replace('{n}', String(stars))}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">{d.comment.label}</label>
              <textarea
                id="worker-rate-comment"
                className="form-textarea"
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={d.comment.placeholder}
              />
            </div>

            <button
              id="worker-submit-rating-btn"
              type="submit"
              className="btn btn-primary"
            >
              {d.submit}
            </button>
          </form>
        ) : (
          <div className="tw-soft-panel">
            <div className="tw-row">
              <span className="tw-avatar">済</span>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>{d.success.title}</div>
                <div>{d.success.desc.replace('{n}', String(stars))}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

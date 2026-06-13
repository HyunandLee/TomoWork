'use client';
import { useState } from 'react';
import type { Dictionary } from '@/app/worker/dictionaries';

export type PendingReview = {
  hireId: string;
  employerName: string;
  jobTitle: string;
  month: string;
  rated: boolean;
};

type Props = {
  d: Dictionary['rate'];
  prefillHireId?: string;
  pendingReviews?: PendingReview[];
};

export default function WorkerRateClient({ d, prefillHireId = '', pendingReviews = [] }: Props) {
  const [hireId, setHireId] = useState(prefillHireId);
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

      {pendingReviews.length > 0 && (
        <div className="card">
          <div className="card-title">{d.pending.title}</div>
          <p className="text-sm text-muted" style={{ marginTop: '-.25rem' }}>{d.pending.desc}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem' }}>
            {pendingReviews.map((p) => (
              <div key={p.hireId} className="tw-row-between" style={{ gap: '.5rem', padding: '.5rem .75rem', background: 'var(--blue-pale2)', borderRadius: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800 }}>{p.employerName}</div>
                  <div style={{ color: 'var(--tw-muted)', fontSize: '.8rem' }}>{p.jobTitle} ・ {p.month}{d.pending.month_suffix}</div>
                </div>
                {p.rated ? (
                  <span className="badge badge-green">{d.pending.rated}</span>
                ) : (
                  <button
                    type="button"
                    className={`btn btn-sm ${hireId === p.hireId ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setHireId(p.hireId); setSubmitted(false); setMsg(''); }}
                  >
                    {d.pending.select}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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

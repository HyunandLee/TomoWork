'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { HireEvent } from '@/lib/types';
import type { DocPreview } from '@/lib/submission/submit';
import type { Submission } from '@/lib/types';
import { uiStateFor } from '@/lib/constants/uiStateMap';

type HireOption = HireEvent & {
  workerName?: string;
  workerNameKana?: string;
  jobTitle?: string;
};

interface Props {
  pendingHires: HireOption[];
  selectedHireId?: string;
  preview?: DocPreview;
  submission?: Submission;
  submitError?: string;
}

export default function DocClient({ pendingHires, selectedHireId, preview, submission, submitError }: Props) {
  const router = useRouter();
  const [submittedResult, setSubmittedResult] = useState<Submission | undefined>(submission);
  const [localSubmitError, setLocalSubmitError] = useState(submitError ?? '');
  const [submitting, setSubmitting] = useState(false);

  // 提出後の「今月の働き」レビュー（労働者を星評価）
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  async function handleReview() {
    if (!selectedHireId) return;
    if (!reviewStars) { setReviewMsg('星を選択してください'); return; }
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hireId: selectedHireId, raterRole: 'employer', stars: reviewStars, comment: reviewComment }),
    });
    const data = await res.json();
    if (data.ok) {
      setReviewDone(true);
      setReviewMsg('');
    } else {
      setReviewMsg(`エラー: ${data.error}`);
    }
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setSubmittedResult(undefined);
    setLocalSubmitError('');
    setReviewStars(0);
    setReviewComment('');
    setReviewDone(false);
    setReviewMsg('');
    router.push(e.target.value ? `/employer/doc?hireId=${e.target.value}` : '/employer/doc');
  }

  async function handleSubmit() {
    if (!selectedHireId || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/hire/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hireId: selectedHireId }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmittedResult(data.data);
        setLocalSubmitError('');
        router.refresh();
      } else {
        setLocalSubmitError(data.error);
      }
    } catch {
      setLocalSubmitError('提出に失敗しました。通信状態を確認してください。');
    } finally {
      setSubmitting(false);
    }
  }

  const uiState = preview ? uiStateFor(preview.validation.code) : null;
  const canRenderDocument = Boolean(preview?.validation.ok);

  return (
    <div className="page-body tw-page">
      <div className="tw-hero">
        <div>
          <div className="tw-kicker" style={{ color: 'rgba(255,255,255,.72)' }}>Auto Documents</div>
          <h1>書類生成・提出</h1>
          <p>在留資格をチェックし、様式第3号を自動入力して、提出まで模擬します。</p>
        </div>
        <span className="tw-chip" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>様式第3号</span>
      </div>

      <div className="card">
        <div className="card-title">就労者を選択</div>
        <select
          id="hire-select"
          className="form-select"
          value={selectedHireId ?? ''}
          onChange={handleSelect}
        >
          <option value="">— 就労者を選択してください —</option>
          {pendingHires.map(h => (
            <option key={h.id} value={h.id}>
              {h.workerName ?? h.workerId} / {h.jobTitle ?? h.jobCategory} / 週{h.weeklyHours}h / {h.hireDate}
            </option>
          ))}
        </select>
        <div className="form-hint mt-sm">採用済みの就労を表示しています。毎月の提出で、その月の給与が更新されます。</div>
      </div>

      {preview && (
        <>
          <div className={`${uiState?.color === 'green' ? 'tw-soft-panel' : 'tw-coral-panel'} no-print`}>
            <div className="tw-row">
            <span className="tw-avatar" style={uiState?.color === 'green' ? undefined : { background: '#fff', color: 'var(--tw-coral)' }}>
              {uiState?.color === 'green' ? '可' : '止'}
            </span>
            <div>
              <div style={{ fontWeight: 800, color: uiState?.color === 'green' ? 'var(--tw-primary-dark)' : '#9a3d26' }}>
                {uiState?.color === 'green' ? '就労可能 — 提出できます' : '就労不可 — 提出できません'}
              </div>
              <div>{preview.validation.reasonJa}</div>
              <div style={{ fontSize: '.78rem', marginTop: '.25rem', opacity: .7 }}>
                コード: {preview.validation.code} / {preview.worker.nameRoman} / {preview.worker.residenceStatus} / 週{preview.hire.weeklyHours}h
              </div>
            </div>
            </div>
          </div>

          {canRenderDocument && (
            <div className="shiki3-doc" style={{ borderRadius: 16 }}>
              <div className="tw-row-between" style={{ marginBottom: '1rem' }}>
                <div>
                  <div className="tw-kicker">ハローワーク提出用</div>
                  <div className="shiki3-title" style={{ textAlign: 'left', borderBottom: 0, paddingBottom: 0, marginBottom: 0 }}>{preview.doc.titleJa}</div>
                </div>
                <span className="tw-chip">自動入力</span>
              </div>
              <table className="shiki3-table">
                <tbody>
                  {preview.doc.fields.map(f => (
                    <tr key={f.key}>
                      <th>{f.labelJa}</th>
                      <td>{f.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {canRenderDocument && !submittedResult && (
            <div className="tw-actions mt-lg no-print">
              <button
                id="submit-shiki3-btn"
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '提出中...' : '提出予定日に提出する'}
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => window.print()}
              >
                PDFで保存
              </button>
            </div>
          )}

          {localSubmitError && (
            <div className="alert alert-error mt-lg">{localSubmitError}</div>
          )}
        </>
      )}

      {submittedResult && (
        <div className="tw-soft-panel mt-lg">
          <div className="tw-row">
          <span className="tw-avatar">済</span>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>受付完了！</div>
            <div>受付番号: <strong style={{ fontFamily: 'monospace' }}>{submittedResult.receiptNo}</strong></div>
            <div>受理日時: {submittedResult.createdAt.slice(0, 19).replace('T', ' ')}</div>
            <div>状態: <span className="badge badge-green">{submittedResult.status}</span></div>
            <div style={{ color: 'var(--tw-muted)', fontSize: '.85rem', fontWeight: 700, marginTop: '.25rem' }}>
              この提出内容をもとに、労働者側の給与へ自動反映されます。
            </div>
          </div>
          </div>
        </div>
      )}

      {submittedResult && (
        <div className="card mt-lg no-print">
          <div className="card-title">今月の働きをレビュー</div>
          <div className="form-hint mb">
            提出が完了しました。{preview?.worker.nameRoman ? <strong>{preview.worker.nameRoman}</strong> : '労働者'} の今月の働きを星1〜5で評価してください。
          </div>

          {reviewMsg && <div className="alert alert-error mb">{reviewMsg}</div>}

          {!reviewDone ? (
            <>
              <div className="form-group">
                <label className="form-label">星1〜5</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      id={`doc-review-star-${n}`}
                      className={`star ${reviewStars >= n ? 'filled' : ''}`}
                      onClick={() => setReviewStars(n)}
                      style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: reviewStars >= n ? '#f59e0b' : 'var(--gray-300)' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">コメント（任意）</label>
                <textarea
                  className="form-textarea"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="今月の働きについてのコメント..."
                />
              </div>
              <button id="doc-submit-review-btn" className="btn btn-primary" onClick={handleReview}>
                レビューを送信
              </button>
            </>
          ) : (
            <div className="tw-soft-panel">
              <div className="tw-row">
                <span className="tw-avatar">済</span>
                <div style={{ fontWeight: 800, color: 'var(--tw-primary-dark)' }}>レビューを送信しました（{reviewStars}星）</div>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedHireId && pendingHires.length === 0 && (
        <div className="empty-state card">
          <div className="empty-state-icon">📄</div>
          <h3>待機中の就労がありません</h3>
          <p>応募者を採用すると書類生成の対象が表示されます</p>
        </div>
      )}
    </div>
  );
}

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

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    setSubmittedResult(undefined);
    setLocalSubmitError('');
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
        <div className="form-hint mt-sm">採用済みで提出待ちの就労だけを表示しています。</div>
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

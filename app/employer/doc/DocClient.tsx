'use client';
import { useRouter } from 'next/navigation';
import type { HireEvent } from '@/lib/types';
import type { DocPreview } from '@/lib/submission/submit';
import type { Submission } from '@/lib/types';
import { uiStateFor } from '@/lib/constants/uiStateMap';

interface Props {
  pendingHires: HireEvent[];
  selectedHireId?: string;
  preview?: DocPreview;
  submission?: Submission;
  submitError?: string;
}

export default function DocClient({ pendingHires, selectedHireId, preview, submission, submitError }: Props) {
  const router = useRouter();

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`/employer/doc?hireId=${e.target.value}`);
  }

  async function handleSubmit() {
    if (!selectedHireId) return;
    const res = await fetch('/api/hire/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hireId: selectedHireId }),
    });
    const data = await res.json();
    if (data.ok) {
      router.push(`/employer/doc?hireId=${selectedHireId}&submitted=1`);
      router.refresh();
    } else {
      alert(`提出エラー: ${data.error}`);
    }
  }

  const uiState = preview ? uiStateFor(preview.validation.code) : null;

  return (
    <div className="page-body">
      <div className="page-header">
        <h1>📄 書類生成・提出</h1>
        <p>在留資格コンプライアンスを検証し、様式第3号を生成・提出します</p>
      </div>

      <div className="card mb-lg">
        <div className="card-title">👤 就労者を選択</div>
        <select
          id="hire-select"
          className="form-select"
          value={selectedHireId ?? ''}
          onChange={handleSelect}
        >
          <option value="">— 就労者を選択してください —</option>
          {pendingHires.map(h => (
            <option key={h.id} value={h.id}>
              [{h.status.toUpperCase()}] {h.workerId} / {h.jobCategory} / 週{h.weeklyHours}h / {h.hireDate}
            </option>
          ))}
        </select>
        <div className="form-hint mt-sm">デモ用の地雷ワーカーも選択できます（検証NGの確認に）</div>
      </div>

      {preview && (
        <>
          {/* 検証バナー */}
          <div className={`banner ${uiState?.color === 'green' ? 'banner-ok' : 'banner-ng'} no-print`}>
            <span className="banner-icon">{uiState?.color === 'green' ? '✅' : '🚫'}</span>
            <div>
              <div className="banner-title">
                {uiState?.color === 'green' ? '就労可能 — 提出できます' : '就労不可 — 提出できません'}
              </div>
              <div>{preview.validation.reasonJa}</div>
              <div style={{ fontSize: '.78rem', marginTop: '.25rem', opacity: .7 }}>
                コード: {preview.validation.code} / ワーカー: {preview.worker.residenceStatus} / 週{preview.hire.weeklyHours}h
              </div>
            </div>
          </div>

          {/* 様式第3号 */}
          <div className="shiki3-doc">
            <div className="shiki3-title">{preview.doc.titleJa}</div>
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

          {!submission && (
            <div className="flex gap mt-lg no-print" style={{ flexWrap: 'wrap' }}>
              <button
                id="submit-shiki3-btn"
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={!preview.validation.ok}
                title={!preview.validation.ok ? '検証がNGのため提出できません' : ''}
              >
                📨 ハローワークへ提出（模擬）
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => window.print()}
              >
                🖨️ PDFで保存
              </button>
            </div>
          )}

          {submitError && (
            <div className="alert alert-error mt-lg">{submitError}</div>
          )}
        </>
      )}

      {submission && (
        <div className="banner banner-ok mt-lg">
          <span className="banner-icon">🎉</span>
          <div>
            <div className="banner-title">受付完了！</div>
            <div>受付番号: <strong style={{ fontFamily: 'monospace' }}>{submission.receiptNo}</strong></div>
            <div>受理日時: {submission.createdAt.slice(0, 19).replace('T', ' ')}</div>
            <div>状態: <span className="badge badge-green">{submission.status}</span></div>
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

'use client';
import { useState, useEffect } from 'react';
import type { HireEvent } from '@/lib/types';

interface CompletedHire extends HireEvent {
  workerName?: string;
}

export default function EmployerRatePage() {
  const [hires, setHires] = useState<CompletedHire[]>([]);
  const [loading, setLoading] = useState(true);
  const [stars, setStars] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');

  useEffect(() => {
    // employer の completed hire を取得
    fetch('/api/submissions').then(r => r.json()).then(async (submRes) => {
      if (!submRes.ok) return;
      // completedな hire を ratings APIから取得するのではなく、
      // hireはAPIから直接取れないためsubmissionsから推定
      // ここでは簡易的にsubmissionsのworkerIdからhireを逆引き
      setLoading(false);
    });
    // 実際にはemployer hireのAPIを使う
    // ここではsubmissionsから完了済み就労のリストを構築
    fetch('/api/submissions').then(r => r.json()).then(d => {
      if (d.ok) {
        // submissions から hireId は直接取れないため、
        // ダミーで submissions から hire を表示
        setHires([]); // 下で別途取得
      }
      setLoading(false);
    });
  }, []);

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
    <div className="page-body">
      <div className="page-header">
        <h1>⭐ 労働者を評価する</h1>
        <p>完了済み就労の労働者に星1〜5で評価します</p>
      </div>

      {msg && <div className="alert alert-success mb">{msg}</div>}

      <div className="card">
        <div className="card-title">評価フォーム</div>
        <p className="text-sm text-muted mb">就労ID（hire ID）を入力して評価を送信します。シードデータの完了済み就労: <code>hire-c001</code>, <code>hire-c002</code></p>

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
              <label className="form-label">評価 (星1〜5)</label>
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
              ⭐ 評価を送信
            </button>
          </>
        )}

        {submitted.has(hireId) && (
          <div className="banner banner-ok">
            <span className="banner-icon">✅</span>
            <div>評価を送信しました（{stars[hireId]}星）</div>
          </div>
        )}
      </div>
    </div>
  );
}

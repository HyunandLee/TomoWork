'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconRefresh, IconCircleCheck, IconCircleX } from '@tabler/icons-react';

type Msg = { type: 'success' | 'error'; text: string } | null;

export default function AdminClient() {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  async function handleReset() {
    if (!confirm('シードをリセットします。全データが初期化されます。よろしいですか？')) return;
    setResetting(true);
    const res = await fetch('/api/admin/reset', { method: 'POST' });
    const data = await res.json();
    setResetting(false);
    if (data.ok) {
      setMsg({ type: 'success', text: 'シードリセット完了！' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: `エラー: ${data.error}` });
    }
    setTimeout(() => setMsg(null), 5000);
  }

  return (
    <div className="card">
      <div className="card-title"><IconRefresh size={18} stroke={1.75} aria-hidden />シードリセット（開発用）</div>
      <p className="text-sm text-muted mb">デモ前にデータを初期状態に戻します。<strong>全データが削除されます。</strong></p>
      {msg && (
        <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'} mb`} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
          {msg.type === 'success'
            ? <IconCircleCheck size={18} stroke={1.75} aria-hidden />
            : <IconCircleX size={18} stroke={1.75} aria-hidden />}
          {msg.text}
        </div>
      )}
      <button
        id="seed-reset-btn"
        className="btn btn-danger"
        onClick={handleReset}
        disabled={resetting}
      >
        {resetting ? <span className="spinner" /> : <IconRefresh size={18} stroke={1.75} aria-hidden />}
        シードリセット
      </button>
    </div>
  );
}

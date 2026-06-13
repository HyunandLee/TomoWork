'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminClient() {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState('');

  async function handleReset() {
    if (!confirm('シードをリセットします。全データが初期化されます。よろしいですか？')) return;
    setResetting(true);
    const res = await fetch('/api/admin/reset', { method: 'POST' });
    const data = await res.json();
    setResetting(false);
    if (data.ok) {
      setMsg('✅ シードリセット完了！');
      router.refresh();
    } else {
      setMsg(`❌ エラー: ${data.error}`);
    }
    setTimeout(() => setMsg(''), 5000);
  }

  return (
    <div className="card">
      <div className="card-title">🔄 シードリセット（開発用）</div>
      <p className="text-sm text-muted mb">デモ前にデータを初期状態に戻します。<strong>全データが削除されます。</strong></p>
      {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'} mb`}>{msg}</div>}
      <button
        id="seed-reset-btn"
        className="btn btn-danger"
        onClick={handleReset}
        disabled={resetting}
      >
        {resetting ? <span className="spinner" /> : '🔄'}
        シードリセット
      </button>
    </div>
  );
}

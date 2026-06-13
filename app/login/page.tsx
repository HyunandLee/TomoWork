'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await signIn('credentials', { email, password, redirect: false });
      if (res?.error) {
        setError('メールアドレスまたはパスワードが正しくありません');
        return;
      }
      window.location.assign('/');
    } catch (e) {
      console.error('[login] signIn failed:', e);
      setError('ログイン処理でエラーが起きました。開発サーバーのログを確認してください。');
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(roleEmail: string) {
    setLoading(true);
    setError('');
    try {
      const res = await signIn('credentials', { email: roleEmail, password: 'password', redirect: false });
      if (res?.error) {
        setError('クイックログインに失敗しました');
        return;
      }
      window.location.assign('/');
    } catch (e) {
      console.error('[login] quick signIn failed:', e);
      setError('クイックログイン処理でエラーが起きました。開発サーバーのログを確認してください。');
    } finally {
      setLoading(false);
    }
  }

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/tuna-icon.png" alt="Tuna Work" />
          <h1>Tuna <span style={{ color: 'var(--blue)' }}>Work</span></h1>
          <p>外国人雇用マッチング＆書類生成プラットフォーム</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="email">メールアドレス</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">パスワード</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              autoComplete="current-password"
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full btn-lg"
            style={{ justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : '🔑'}
            ログイン
          </button>
        </form>

        {isDev && (
          <>
            <div className="login-divider">開発用クイックログイン</div>
            <div className="dev-buttons">
              <button
                type="button"
                id="quick-login-employer"
                className="dev-btn"
                onClick={() => quickLogin('employer@example.com')}
                disabled={loading}
              >
                  <span className="dev-btn-icon">🏢</span>
                  <div>
                  <div>サカナカフェとしてログイン</div>
                  <span className="dev-label">employer@example.com / password</span>
                </div>
              </button>
              <button
                type="button"
                id="quick-login-mart"
                className="dev-btn"
                onClick={() => quickLogin('mart@example.com')}
                disabled={loading}
              >
                <span className="dev-btn-icon">🏪</span>
                <div>
                  <div>小売企業としてログイン</div>
                  <span className="dev-label">mart@example.com / password</span>
                </div>
              </button>
              <button
                type="button"
                id="quick-login-delivery"
                className="dev-btn"
                onClick={() => quickLogin('delivery@example.com')}
                disabled={loading}
              >
                <span className="dev-btn-icon">🚚</span>
                <div>
                  <div>配送企業としてログイン</div>
                  <span className="dev-label">delivery@example.com / password</span>
                </div>
              </button>
              <button
                type="button"
                id="quick-login-hotel"
                className="dev-btn"
                onClick={() => quickLogin('hotel@example.com')}
                disabled={loading}
              >
                <span className="dev-btn-icon">🏨</span>
                <div>
                  <div>ホテル企業としてログイン</div>
                  <span className="dev-label">hotel@example.com / password</span>
                </div>
              </button>
              <button
                type="button"
                id="quick-login-worker"
                className="dev-btn"
                onClick={() => quickLogin('worker@example.com')}
                disabled={loading}
              >
                <span className="dev-btn-icon">👷</span>
                <div>
                  <div>労働者としてログイン</div>
                  <span className="dev-label">worker@example.com / password</span>
                </div>
              </button>
              <button
                type="button"
                id="quick-login-admin"
                className="dev-btn"
                onClick={() => quickLogin('admin@example.com')}
                disabled={loading}
              >
                <span className="dev-btn-icon">⚙️</span>
                <div>
                  <div>管理者としてログイン</div>
                  <span className="dev-label">admin@example.com / password</span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

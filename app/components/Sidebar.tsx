'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

interface SidebarProps {
  role: 'employer' | 'worker' | 'admin';
  email: string;
}

const EMPLOYER_NAV: NavItem[] = [
  { href: '/employer', icon: '✦', label: 'ダッシュボード' },
  { href: '/employer/jobs', icon: '▣', label: '求人' },
  { href: '/employer/applicants', icon: '◉', label: '応募者' },
  { href: '/employer/doc', icon: '□', label: '書類生成・提出' },
  { href: '/employer/history', icon: '≡', label: '届出履歴' },
  { href: '/employer/rate', icon: '★', label: '評価する' },
];

const WORKER_NAV: NavItem[] = [
  { href: '/worker', icon: '✦', label: 'ダッシュボード' },
  { href: '/worker/jobs', icon: '⌕', label: 'バイト先を探す' },
  { href: '/worker/documents', icon: '□', label: '自分の書類' },
  { href: '/worker/earnings', icon: '¥', label: '稼ぎ記録' },
  { href: '/worker/rate', icon: '★', label: '評価する' },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', icon: '⚙️', label: '管理画面' },
];

const ROLE_LABELS = { employer: '雇用主', worker: '労働者', admin: '管理者' };
const NAV_MAP = { employer: EMPLOYER_NAV, worker: WORKER_NAV, admin: ADMIN_NAV };

export default function Sidebar({ role, email }: SidebarProps) {
  const pathname = usePathname();
  const nav = NAV_MAP[role];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/tuna-icon.png" alt="Tuna Work" />
        <div>
          <span className="sidebar-logo-text">Tuna<span>Work</span></span>
          <div style={{ fontSize: '.62rem', fontWeight: 800, color: 'var(--tw-primary-dark)', letterSpacing: '.08em', marginTop: '.1rem' }}>
            {role === 'employer' ? 'FOR BUSINESS' : role === 'worker' ? 'WORKER APP' : 'ADMIN'}
          </div>
        </div>
      </div>
      <div className="sidebar-role-badge">{ROLE_LABELS[role]}</div>
      <nav className="sidebar-nav">
        {nav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href)) ? 'active' : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ marginBottom: '.5rem', wordBreak: 'break-all' }}>{email}</div>
        {role === 'employer' && (
          <div className="tw-coral-panel" style={{ marginBottom: '.75rem', padding: '.75rem', fontSize: '.75rem', lineHeight: 1.5, color: '#9a3d26' }}>
            利用料の一部がワーカーの日本語学習・生活相談に使われます。
          </div>
        )}
        <button
          id="sidebar-logout"
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tw-muted)', fontSize: '.85rem', padding: 0 }}
        >
          ログアウト
        </button>
      </div>
    </aside>
  );
}

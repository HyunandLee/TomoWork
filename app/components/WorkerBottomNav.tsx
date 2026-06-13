'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/worker/jobs', icon: '⌕', label: 'さがす' },
  { href: '/worker', icon: '▣', label: 'しごと' },
  { href: '/worker/consult', icon: '♡', label: 'そうだん' },
  { href: '/worker/documents', icon: '□', label: 'しょるい' },
  { href: '/worker/earnings', icon: '◉', label: 'マイ' },
];

export default function WorkerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="worker-bottom-nav" aria-label="worker navigation">
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className={active ? 'active' : ''}>
            <span className="worker-bottom-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Dictionary } from '@/app/worker/dictionaries';

type Props = {
  lang: string;
  nav: Dictionary['nav'];
};

export default function WorkerBottomNav({ lang, nav }: Props) {
  const pathname = usePathname();

  const ITEMS = [
    { href: `/worker/${lang}/jobs`, icon: '⌕', label: nav.search },
    { href: `/worker/${lang}`, icon: '▣', label: nav.jobs },
    { href: `/worker/${lang}/consult`, icon: '♡', label: nav.consult },
    { href: `/worker/${lang}/documents`, icon: '□', label: nav.documents },
    { href: `/worker/${lang}/earnings`, icon: '◉', label: nav.mypage },
  ];

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

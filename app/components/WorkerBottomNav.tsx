'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconSearch,
  IconBriefcase,
  IconMessageCircle,
  IconFileText,
  IconUser,
} from '@tabler/icons-react';
import type { Dictionary } from '@/app/worker/dictionaries';

type Props = {
  lang: string;
  nav: Dictionary['nav'];
};

export default function WorkerBottomNav({ lang, nav }: Props) {
  const pathname = usePathname();

  const ITEMS = [
    { href: `/worker/${lang}/jobs`, Icon: IconSearch, label: nav.search },
    { href: `/worker/${lang}`, Icon: IconBriefcase, label: nav.jobs },
    { href: `/worker/${lang}/consult`, Icon: IconMessageCircle, label: nav.consult },
    { href: `/worker/${lang}/documents`, Icon: IconFileText, label: nav.documents },
    { href: `/worker/${lang}/earnings`, Icon: IconUser, label: nav.mypage },
  ];

  return (
    <nav className="worker-bottom-nav" aria-label="worker navigation">
      {ITEMS.map(({ href, Icon, label }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={active ? 'active' : ''}>
            <span className="worker-bottom-icon">
              <Icon size={24} stroke={1.75} aria-hidden />
            </span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

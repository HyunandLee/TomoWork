'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/app/worker/dictionaries';

const LOCALES: { code: Locale; label: string; title: string }[] = [
  { code: 'ja', label: 'あ',  title: 'やさしい日本語' },
  { code: 'en', label: 'EN', title: 'English' },
  { code: 'vi', label: 'VI', title: 'Tiếng Việt' },
  { code: 'ku', label: 'KU', title: 'Kurdî' },
];

export default function LangSwitcher({ currentLang }: { currentLang: Locale }) {
  const pathname = usePathname();

  return (
    <div className="lang-switcher" aria-label="language switcher">
      {LOCALES.map(({ code, label, title }) => {
        const href = pathname.replace(
          /^\/worker\/[^/]*/,
          `/worker/${code}`
        );
        const active = currentLang === code;
        return (
          <Link
            key={code}
            href={href}
            className={active ? 'active' : ''}
            aria-current={active ? 'true' : undefined}
            title={title}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

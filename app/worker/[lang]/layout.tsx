import { notFound } from 'next/navigation';
import WorkerBottomNav from '@/app/components/WorkerBottomNav';
import LangSwitcher from '@/app/components/LangSwitcher';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { Locale } from '@/app/worker/dictionaries';

export default async function WorkerLangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <div className="worker-stage">
      <div className="worker-brand">
        <img src="/tuna-icon.png" alt="" />
        <div>
          <strong>TunaWork</strong>
          <span>{dict.brand.tagline}</span>
        </div>
        <LangSwitcher currentLang={lang as Locale} />
      </div>
      <div className="ios-device">
        <div className="ios-island" />
        <div className="ios-status">
          <span>9:41</span>
          <span>●●●</span>
        </div>
        <main className="worker-app-scroll">{children}</main>
        <WorkerBottomNav lang={lang} nav={dict.nav} />
        <div className="ios-home-indicator" />
      </div>
    </div>
  );
}

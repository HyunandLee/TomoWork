import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { Locale } from '@/app/worker/dictionaries';
import WorkerRateClient from './WorkerRateClient';

export default async function WorkerRatePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  return <WorkerRateClient d={dict.rate} />;
}

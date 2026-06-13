import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { Locale } from '@/app/worker/dictionaries';
import WorkerJobsClient from './WorkerJobsClient';

export default async function WorkerJobsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);
  return <WorkerJobsClient d={dict.jobs} />;
}

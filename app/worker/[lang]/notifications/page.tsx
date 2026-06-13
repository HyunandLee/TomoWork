import { auth } from '@/lib/auth/options';
import { redirect, notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/app/worker/dictionaries';
import type { SessionUser } from '@/lib/types';
import type { Locale } from '@/app/worker/dictionaries';
import NotificationsClient from './NotificationsClient';

export default async function WorkerNotificationsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (!user.linkedWorkerId) redirect('/login');

  const dict = await getDictionary(lang as Locale);
  return <NotificationsClient lang={lang} d={dict.notifications} />;
}

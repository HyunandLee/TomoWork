import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/options';
import Sidebar from '@/app/components/Sidebar';
import type { SessionUser } from '@/lib/types';

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (user.role !== 'worker') redirect('/login');

  return (
    <div className="page-shell">
      <Sidebar role="worker" email={user.email} />
      <div className="main-content">{children}</div>
    </div>
  );
}

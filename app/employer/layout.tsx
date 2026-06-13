import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/options';
import Sidebar from '@/app/components/Sidebar';
import type { SessionUser } from '@/lib/types';

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (user.role !== 'employer') redirect('/login');

  return (
    <div className="page-shell">
      <Sidebar role="employer" email={user.email} />
      <div className="main-content">{children}</div>
    </div>
  );
}

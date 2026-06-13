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
    <div className="business-stage">
      <div className="business-brand">
        <img src="/tuna-icon.png" alt="" />
        <strong>TunaWork</strong>
        <span>for Business</span>
      </div>
      <div className="browser-window">
        <div className="browser-tabbar">
          <span className="traffic red" />
          <span className="traffic yellow" />
          <span className="traffic green" />
          <div className="browser-tab">TunaWork for Business</div>
        </div>
        <div className="browser-toolbar">
          <div className="browser-url">business.tunawork.jp/dashboard</div>
        </div>
        <div className="page-shell business-shell">
          <Sidebar role="employer" email={user.email} />
          <div className="main-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

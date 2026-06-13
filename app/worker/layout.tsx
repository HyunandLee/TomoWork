import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/options';
import WorkerBottomNav from '@/app/components/WorkerBottomNav';
import type { SessionUser } from '@/lib/types';

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const user = session.user as unknown as SessionUser;
  if (user.role !== 'worker') redirect('/login');

  return (
    <div className="worker-stage">
      <div className="worker-brand">
        <img src="/tuna-icon.png" alt="" />
        <div>
          <strong>TunaWork</strong>
          <span>外国人のための スキマワーク</span>
        </div>
      </div>
      <div className="ios-device">
        <div className="ios-island" />
        <div className="ios-status">
          <span>9:41</span>
          <span>●●●</span>
        </div>
        <main className="worker-app-scroll">{children}</main>
        <WorkerBottomNav />
        <div className="ios-home-indicator" />
      </div>
    </div>
  );
}

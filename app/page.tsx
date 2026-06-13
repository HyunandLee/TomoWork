import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/options';

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const role = (session.user as { role?: string }).role;
  if (role === 'employer') redirect('/employer');
  if (role === 'worker') redirect('/worker');
  if (role === 'admin') redirect('/admin');
  redirect('/login');
}

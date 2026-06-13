// APIルート共通: セッション取得ヘルパー。
import { auth } from '@/lib/auth/options';
import type { SessionUser } from '@/lib/types';

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as unknown as SessionUser;
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    linkedEmployerId: u.linkedEmployerId,
    linkedWorkerId: u.linkedWorkerId,
  };
}

export function ok<T>(data: T): Response {
  return Response.json({ ok: true, data });
}

export function err(message: string, status = 400, code?: string): Response {
  return Response.json({ ok: false, error: message, ...(code ? { code } : {}) }, { status });
}

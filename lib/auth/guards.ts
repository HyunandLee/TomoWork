// ロール別アクセス制御（フレームワーク非依存な純関数）。NextAuth を import しない。
import type { Role, SessionUser } from '@/lib/types';

export class UnauthorizedError extends Error {
  status = 401;
  constructor(msg = 'ログインが必要です') {
    super(msg);
    this.name = 'UnauthorizedError';
  }
}
export class ForbiddenError extends Error {
  status = 403;
  constructor(msg = 'この操作を行う権限がありません') {
    super(msg);
    this.name = 'ForbiddenError';
  }
}

export function hasRole(user: SessionUser | null | undefined, roles: Role[]): boolean {
  return !!user && roles.includes(user.role);
}

/** roles のいずれかでなければ例外。OK なら user を返す。 */
export function ensureRole(user: SessionUser | null | undefined, roles: Role[]): SessionUser {
  if (!user) throw new UnauthorizedError();
  if (!roles.includes(user.role)) throw new ForbiddenError();
  return user;
}

/**
 * worker 個人データへのアクセス可否。
 * - admin: 全件可
 * - worker: 自分に紐づくデータのみ可
 * - employer: 不可
 */
export function canAccessWorkerData(
  user: SessionUser | null | undefined,
  workerId: string,
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'worker') return user.linkedWorkerId === workerId;
  return false;
}

export function ensureWorkerData(
  user: SessionUser | null | undefined,
  workerId: string,
): SessionUser {
  if (!user) throw new UnauthorizedError();
  if (!canAccessWorkerData(user, workerId)) throw new ForbiddenError();
  return user;
}

/**
 * employer データへのアクセス可否。
 * - admin: 全件可
 * - employer: 自社のみ可
 * - worker: 不可
 */
export function canAccessEmployerData(
  user: SessionUser | null | undefined,
  employerId: string,
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'employer') return user.linkedEmployerId === employerId;
  return false;
}

export function ensureEmployerData(
  user: SessionUser | null | undefined,
  employerId: string,
): SessionUser {
  if (!user) throw new UnauthorizedError();
  if (!canAccessEmployerData(user, employerId)) throw new ForbiddenError();
  return user;
}

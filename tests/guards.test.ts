import { describe, it, expect } from 'vitest';
import {
  hasRole,
  ensureRole,
  canAccessWorkerData,
  canAccessEmployerData,
  ensureWorkerData,
  ensureEmployerData,
  UnauthorizedError,
  ForbiddenError,
} from '@/lib/auth/guards';
import type { SessionUser } from '@/lib/types';

function makeUser(overrides: Partial<SessionUser>): SessionUser {
  return {
    id: 'usr-1',
    email: 'test@example.com',
    role: 'worker',
    ...overrides,
  };
}

describe('hasRole()', () => {
  it('ロールが一致する場合 true', () => {
    const u = makeUser({ role: 'employer' });
    expect(hasRole(u, ['employer'])).toBe(true);
  });

  it('ロールが一致しない場合 false', () => {
    const u = makeUser({ role: 'worker' });
    expect(hasRole(u, ['employer', 'admin'])).toBe(false);
  });

  it('null の場合 false', () => {
    expect(hasRole(null, ['admin'])).toBe(false);
  });
});

describe('ensureRole()', () => {
  it('未ログイン → UnauthorizedError', () => {
    expect(() => ensureRole(null, ['employer'])).toThrow(UnauthorizedError);
  });

  it('ロール不一致 → ForbiddenError', () => {
    const u = makeUser({ role: 'worker' });
    expect(() => ensureRole(u, ['employer'])).toThrow(ForbiddenError);
  });

  it('ロール一致 → user を返す', () => {
    const u = makeUser({ role: 'admin' });
    expect(ensureRole(u, ['admin', 'employer'])).toBe(u);
  });
});

describe('canAccessWorkerData()', () => {
  it('admin: 誰でも可', () => {
    const u = makeUser({ role: 'admin' });
    expect(canAccessWorkerData(u, 'w-any')).toBe(true);
  });

  it('worker: 自分のID → 可', () => {
    const u = makeUser({ role: 'worker', linkedWorkerId: 'w-001' });
    expect(canAccessWorkerData(u, 'w-001')).toBe(true);
  });

  it('worker: 他人のID → 不可', () => {
    const u = makeUser({ role: 'worker', linkedWorkerId: 'w-001' });
    expect(canAccessWorkerData(u, 'w-002')).toBe(false);
  });

  it('employer: 不可', () => {
    const u = makeUser({ role: 'employer', linkedEmployerId: 'emp-1' });
    expect(canAccessWorkerData(u, 'w-001')).toBe(false);
  });

  it('null: 不可', () => {
    expect(canAccessWorkerData(null, 'w-001')).toBe(false);
  });
});

describe('canAccessEmployerData()', () => {
  it('admin: 誰でも可', () => {
    const u = makeUser({ role: 'admin' });
    expect(canAccessEmployerData(u, 'emp-any')).toBe(true);
  });

  it('employer: 自社 → 可', () => {
    const u = makeUser({ role: 'employer', linkedEmployerId: 'emp-001' });
    expect(canAccessEmployerData(u, 'emp-001')).toBe(true);
  });

  it('employer: 他社 → 不可', () => {
    const u = makeUser({ role: 'employer', linkedEmployerId: 'emp-001' });
    expect(canAccessEmployerData(u, 'emp-002')).toBe(false);
  });

  it('worker: 不可', () => {
    const u = makeUser({ role: 'worker', linkedWorkerId: 'w-001' });
    expect(canAccessEmployerData(u, 'emp-001')).toBe(false);
  });
});

describe('ensureWorkerData()', () => {
  it('未ログイン → UnauthorizedError', () => {
    expect(() => ensureWorkerData(null, 'w-1')).toThrow(UnauthorizedError);
  });

  it('worker が他人のデータにアクセス → ForbiddenError', () => {
    const u = makeUser({ role: 'worker', linkedWorkerId: 'w-001' });
    expect(() => ensureWorkerData(u, 'w-002')).toThrow(ForbiddenError);
  });

  it('admin は通過', () => {
    const u = makeUser({ role: 'admin' });
    expect(ensureWorkerData(u, 'w-any')).toBe(u);
  });
});

describe('ensureEmployerData()', () => {
  it('employer が他社データ → ForbiddenError', () => {
    const u = makeUser({ role: 'employer', linkedEmployerId: 'emp-001' });
    expect(() => ensureEmployerData(u, 'emp-002')).toThrow(ForbiddenError);
  });

  it('admin は通過', () => {
    const u = makeUser({ role: 'admin' });
    expect(ensureEmployerData(u, 'emp-any')).toBe(u);
  });
});

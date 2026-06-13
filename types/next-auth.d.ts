// NextAuth v5 の型を拡張してセッションに role / linkedEmployerId / linkedWorkerId を追加。
import NextAuth, { DefaultSession } from 'next-auth';
import type { Role } from '@/lib/types';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      role: Role;
      linkedEmployerId?: string;
      linkedWorkerId?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
    linkedEmployerId?: string;
    linkedWorkerId?: string;
  }
}

// NextAuth v5 (Auth.js) Credentials Provider 設定。
// セッションに userId / role / linkedEmployerId / linkedWorkerId を乗せる。
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { repo } from '@/lib/db/repo';
import type { SessionUser } from '@/lib/types';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === 'production' ? undefined : 'tunawork-dev-secret'),
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // 起動時にDBを初期化・シード（lazy initialization）
        try {
          const { getDb } = await import('@/lib/db/migrate');
          const { runSeed, ensureDevSeedData } = await import('@/lib/seed');
          const db = getDb();
          const count = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c;
          if (count === 0) await runSeed();
          if (process.env.NODE_ENV !== 'production') ensureDevSeedData();
        } catch (e) {
          console.error('[auth] seed error:', e);
        }

        const user = repo.getUserByEmail(credentials.email as string);
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!ok) return null;

        const sessionUser: SessionUser = {
          id: user.id,
          email: user.email,
          role: user.role,
          linkedEmployerId: user.linkedEmployerId,
          linkedWorkerId: user.linkedWorkerId,
        };
        // next-auth の authorize はシリアライズ可能なオブジェクトを返す
        return sessionUser as unknown as Record<string, unknown>;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as SessionUser;
        token.id = u.id;
        token.role = u.role;
        token.linkedEmployerId = u.linkedEmployerId;
        token.linkedWorkerId = u.linkedWorkerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as unknown as SessionUser).role = token.role as SessionUser['role'];
        (session.user as unknown as SessionUser).linkedEmployerId = token.linkedEmployerId as string | undefined;
        (session.user as unknown as SessionUser).linkedWorkerId = token.linkedWorkerId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
});

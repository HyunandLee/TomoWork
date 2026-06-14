'use client';

import { signOut } from 'next-auth/react';

export default function WorkerLogoutButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="worker-logout"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      {label}
    </button>
  );
}

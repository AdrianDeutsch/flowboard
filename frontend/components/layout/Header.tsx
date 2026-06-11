'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

/** App header with navigation and logout. */
export function Header() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await api.auth.logout();
    } finally {
      // Even if the API call fails the local session is worthless – leave.
      router.push('/login');
      router.refresh();
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
      <Link href="/dashboard" className="text-sm font-bold tracking-tight text-zinc-900">
        SaaS<span className="text-indigo-600">Light</span>
      </Link>
      <button
        onClick={handleLogout}
        className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100"
      >
        Sign out
      </button>
    </header>
  );
}

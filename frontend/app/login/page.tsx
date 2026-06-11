'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AuthForm, AuthFormValues } from '@/components/auth/AuthForm';

/** Login page – authenticates and redirects to the dashboard. */
export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(values: AuthFormValues) {
    await api.auth.login({ email: values.email, password: values.password });
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-zinc-900">Welcome back</h1>
        <p className="mb-6 text-sm text-zinc-500">Sign in to your boards.</p>
        <AuthForm mode="login" onSubmit={handleLogin} />
      </div>
    </main>
  );
}

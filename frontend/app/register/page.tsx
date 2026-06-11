'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AuthForm, AuthFormValues } from '@/components/auth/AuthForm';

/** Registration page – creates the account and goes straight to the dashboard. */
export default function RegisterPage() {
  const router = useRouter();

  async function handleRegister(values: AuthFormValues) {
    await api.auth.register(values);
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-zinc-900">Create your account</h1>
        <p className="mb-6 text-sm text-zinc-500">Start organizing your projects.</p>
        <AuthForm mode="register" onSubmit={handleRegister} />
      </div>
    </main>
  );
}

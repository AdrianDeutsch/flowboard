'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ApiError } from '@/lib/api';

export interface AuthFormValues {
  email: string;
  password: string;
  name: string;
}

interface AuthFormProps {
  mode: 'login' | 'register';
  /** Called with validated values; rejections are rendered as form errors. */
  onSubmit: (values: AuthFormValues) => Promise<void>;
}

/**
 * Shared login/registration form.
 * Performs lightweight client-side validation for instant feedback;
 * the backend remains the source of truth via Zod.
 */
export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const isRegister = mode === 'register';
  const [values, setValues] = useState<AuthFormValues>({ email: '', password: '', name: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): string | null {
    if (!values.email.includes('@')) return 'Please enter a valid email address.';
    if (isRegister && values.name.trim().length === 0) return 'Please enter your name.';
    if (isRegister && values.password.length < 8)
      return 'Password must be at least 8 characters long.';
    if (!isRegister && values.password.length === 0) return 'Please enter your password.';
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none ' +
    'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {isRegister && (
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={inputClasses}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={inputClasses}
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          className={inputClasses}
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? 'Please wait …' : isRegister ? 'Create account' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-zinc-500">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            No account yet?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:underline">
              Create one
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

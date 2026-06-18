import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Sends already-authenticated visitors away from the login page straight to the
 * dashboard. Server-side, Node runtime — mirrors the dashboard guard inverted.
 */
export default async function LoginLayout({ children }: { children: ReactNode }) {
  const hasSession = (await cookies()).has(AUTH_COOKIE_NAME);
  if (hasSession) redirect('/dashboard');
  return children;
}

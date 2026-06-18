import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Server-side route guard for the dashboard. Redirects to /login when no auth
 * cookie is present. Only checks cookie presence for a fast redirect — the JWT
 * signature is still verified by the backend on every API call. Runs on the
 * Node runtime, reading the first-party cookie kept same-origin by the API
 * proxy. Replaces the former edge middleware.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const hasSession = (await cookies()).has(AUTH_COOKIE_NAME);
  if (!hasSession) redirect('/login');
  return children;
}

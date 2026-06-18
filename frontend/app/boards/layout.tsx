import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Server-side route guard for board pages. Redirects to /login when no auth
 * cookie is present; the backend still verifies the JWT on every API call.
 * Runs on the Node runtime — see DashboardLayout for the rationale.
 */
export default async function BoardsLayout({ children }: { children: ReactNode }) {
  const hasSession = (await cookies()).has(AUTH_COOKIE_NAME);
  if (!hasSession) redirect('/login');
  return children;
}

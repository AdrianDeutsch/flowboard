import { redirect } from 'next/navigation';

/**
 * Root route only dispatches: the middleware sends visitors without a
 * session to /login, everyone else lands on the dashboard.
 */
export default function HomePage() {
  redirect('/dashboard');
}

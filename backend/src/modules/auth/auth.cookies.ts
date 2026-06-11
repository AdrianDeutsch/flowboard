import { Response } from 'express';
import { env } from '../../config/env';

export const AUTH_COOKIE_NAME = 'auth_token';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Sets the JWT as httpOnly cookie so it is never readable from JS (XSS-safe).
 * `sameSite: lax` still allows top-level navigation while blocking CSRF
 * on cross-site POSTs; `secure` is enforced outside of local development.
 */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  });
}

/** Clears the auth cookie (logout). */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
}

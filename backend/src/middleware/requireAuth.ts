import { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../modules/auth/auth.tokens';
import { HttpError } from '../errors/HttpError';
import { AUTH_COOKIE_NAME } from '../modules/auth/auth.cookies';

// Augment Express' Request with the authenticated user's id.
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

/**
 * Guard for protected endpoints.
 * Reads the JWT from the httpOnly cookie, verifies it and attaches
 * the user id to the request. Rejects with 401 otherwise.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;
  if (!token) {
    throw HttpError.unauthorized('Authentication required');
  }

  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.sub;
  } catch {
    throw HttpError.unauthorized('Invalid or expired session');
  }

  next();
}

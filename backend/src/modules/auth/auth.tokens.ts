import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export interface AuthTokenPayload {
  /** User id (standard JWT subject claim). */
  sub: string;
}

/**
 * Signs a JWT for the given user id using the configured secret/lifetime.
 */
export function signAuthToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: userId,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verifies a JWT and returns its payload. Throws on invalid/expired tokens.
 */
export function verifyAuthToken(token: string): AuthTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);
  if (typeof payload === 'string' || typeof payload.sub !== 'string') {
    throw new Error('Malformed token payload');
  }
  return { sub: payload.sub };
}

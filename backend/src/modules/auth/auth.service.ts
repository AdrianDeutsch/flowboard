import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { HttpError } from '../../errors/HttpError';
import { signAuthToken } from './auth.tokens';
import { LoginInput, RegisterInput } from './auth.schemas';

const BCRYPT_ROUNDS = 12;

/** User shape exposed to clients – never includes the password hash. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

function toPublicUser(user: { id: string; email: string; name: string }): PublicUser {
  return { id: user.id, email: user.email, name: user.name };
}

/**
 * Registers a new user. Fails with 409 when the email is already taken.
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw HttpError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: input.email, name: input.name, passwordHash },
  });

  return { user: toPublicUser(user), token: signAuthToken(user.id) };
}

/**
 * Verifies credentials and issues a session token.
 * Uses a single generic 401 for unknown email AND wrong password so the
 * endpoint cannot be used to enumerate registered email addresses.
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw HttpError.unauthorized('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw HttpError.unauthorized('Invalid email or password');
  }

  return { user: toPublicUser(user), token: signAuthToken(user.id) };
}

/** Loads the current user's public profile (404 if the account vanished). */
export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw HttpError.notFound('User not found');
  }
  return toPublicUser(user);
}

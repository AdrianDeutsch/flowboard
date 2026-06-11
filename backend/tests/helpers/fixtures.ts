import bcrypt from 'bcryptjs';
import { signAuthToken } from '../../src/modules/auth/auth.tokens';
import { AUTH_COOKIE_NAME } from '../../src/modules/auth/auth.cookies';

export const PLAIN_PASSWORD = 'correct-horse-battery';

/** Builds a complete User row as Prisma would return it. */
export function buildUser(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: 'user-1',
    email: 'jane@example.com',
    name: 'Jane Doe',
    passwordHash: bcrypt.hashSync(PLAIN_PASSWORD, 4),
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Builds a complete Board row as Prisma would return it. */
export function buildBoard(overrides: Partial<BoardRow> = {}): BoardRow {
  return {
    id: 'board-1',
    title: 'My Project',
    description: null,
    ownerId: 'user-1',
    createdAt: new Date('2026-01-02T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  };
}

export interface BoardRow {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Cookie header value for an authenticated request. */
export function authCookie(userId = 'user-1'): string {
  return `${AUTH_COOKIE_NAME}=${signAuthToken(userId)}`;
}

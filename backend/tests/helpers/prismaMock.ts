import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { prisma } from '../../src/lib/prisma';

/**
 * Replaces the Prisma singleton with a deep mock for all tests
 * (registered via jest setupFilesAfterEnv). Tests import `prismaMock`
 * to stub query results – no database required.
 */
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

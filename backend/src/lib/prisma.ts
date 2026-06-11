import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance.
 * Exported from a single module so tests can replace it with a deep mock
 * (see tests/helpers/prismaMock.ts) and the app never spawns
 * multiple connection pools.
 */
export const prisma = new PrismaClient();

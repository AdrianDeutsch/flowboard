/**
 * Jest configuration for backend integration/unit tests.
 * Prisma is mocked via a singleton (see tests/helpers/prismaMock.ts),
 * so tests run without a real database.
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/prismaMock.ts'],
  clearMocks: true,
};

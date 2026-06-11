import 'dotenv/config';
import { z } from 'zod';

/**
 * Validated environment configuration.
 * Fails fast on boot when required variables are missing or malformed,
 * instead of producing cryptic runtime errors later.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://postgres:postgres@localhost:5432/saas_light?schema=public'),
  JWT_SECRET: z.string().min(16).default('dev-only-secret-change-me-please'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_ORIGIN: z.string().url().default('http://localhost:3000'),
});

export const env = envSchema.parse(process.env);

// Never run production with the insecure fallback secret.
if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'dev-only-secret-change-me-please') {
  throw new Error('JWT_SECRET must be set explicitly in production');
}

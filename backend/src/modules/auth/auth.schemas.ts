import { z } from 'zod';

/** Validation rules for POST /api/auth/register. */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
  name: z.string().trim().min(1, 'Name is required').max(100),
});

/** Validation rules for POST /api/auth/login. */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

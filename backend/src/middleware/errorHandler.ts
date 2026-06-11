import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError } from '../errors/HttpError';
import { env } from '../config/env';

/**
 * Global error handling middleware (must be registered last).
 * Maps known error types to proper HTTP status codes and hides
 * internals behind a generic 500 for everything unexpected.
 */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = unique constraint violation, P2025 = record not found
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Resource already exists' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
  }

  // Unexpected error: log full details server-side, expose nothing.
  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled error:', err);
  }
  res.status(500).json({ error: 'Internal server error' });
}

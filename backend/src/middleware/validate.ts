import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

/**
 * Request body validation middleware factory.
 * Parses (and thereby sanitizes/strips) the body with the given Zod
 * schema; ZodErrors bubble up to the global error handler as 400s.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
}

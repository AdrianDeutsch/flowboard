import { z } from 'zod';

/** Validation rules for POST /api/boards/:boardId/columns. */
export const createColumnSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
});

/** Validation rules for PATCH /api/columns/:columnId. */
export const updateColumnSchema = createColumnSchema;

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;

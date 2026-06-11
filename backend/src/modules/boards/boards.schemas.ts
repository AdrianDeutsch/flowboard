import { z } from 'zod';

/** Validation rules for POST /api/boards. */
export const createBoardSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100),
  description: z.string().trim().max(500).optional(),
});

/** Validation rules for PATCH /api/boards/:boardId. */
export const updateBoardSchema = createBoardSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided',
);

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;

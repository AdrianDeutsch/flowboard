import { z } from 'zod';

/** Validation rules for POST /api/columns/:columnId/tasks. */
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
});

/** Validation rules for PATCH /api/tasks/:taskId. */
export const updateTaskSchema = createTaskSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided',
);

/** Validation rules for PATCH /api/tasks/:taskId/move (drag & drop). */
export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1),
  /** Desired zero-based index inside the target column. */
  position: z.number().int().min(0),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;

import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { moveTaskSchema, updateTaskSchema } from './tasks.schemas';
import * as tasksService from './tasks.service';

/** /api/tasks routes – update, delete and drag & drop moves. */
export const tasksRouter = Router();

tasksRouter.use(requireAuth);

tasksRouter.patch('/:taskId/move', validateBody(moveTaskSchema), async (req, res) => {
  // Explicit cast: the middleware in the chain widens Express' param inference.
  const { taskId } = req.params as { taskId: string };
  const task = await tasksService.moveTask(taskId, req.userId!, req.body);
  res.json({ task });
});

tasksRouter.patch('/:taskId', validateBody(updateTaskSchema), async (req, res) => {
  const { taskId } = req.params as { taskId: string };
  const task = await tasksService.updateTask(taskId, req.userId!, req.body);
  res.json({ task });
});

tasksRouter.delete('/:taskId', async (req, res) => {
  await tasksService.deleteTask(req.params.taskId, req.userId!);
  res.status(204).end();
});

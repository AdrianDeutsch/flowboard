import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { updateColumnSchema } from './columns.schemas';
import * as columnsService from './columns.service';
import { createTaskSchema } from '../tasks/tasks.schemas';
import * as tasksService from '../tasks/tasks.service';

/** /api/columns routes – update/delete columns, create tasks within a column. */
export const columnsRouter = Router();

columnsRouter.use(requireAuth);

columnsRouter.patch('/:columnId', validateBody(updateColumnSchema), async (req, res) => {
  // Explicit cast: the middleware in the chain widens Express' param inference.
  const { columnId } = req.params as { columnId: string };
  const column = await columnsService.updateColumn(columnId, req.userId!, req.body);
  res.json({ column });
});

columnsRouter.delete('/:columnId', async (req, res) => {
  await columnsService.deleteColumn(req.params.columnId, req.userId!);
  res.status(204).end();
});

// Tasks are created in the context of their column.
columnsRouter.post('/:columnId/tasks', validateBody(createTaskSchema), async (req, res) => {
  const { columnId } = req.params as { columnId: string };
  const task = await tasksService.createTask(columnId, req.userId!, req.body);
  res.status(201).json({ task });
});

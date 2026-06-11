import { Router } from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { validateBody } from '../../middleware/validate';
import { createBoardSchema, updateBoardSchema } from './boards.schemas';
import * as boardsService from './boards.service';
import { createColumnSchema } from '../columns/columns.schemas';
import * as columnsService from '../columns/columns.service';

/** /api/boards routes – all protected, all scoped to the authenticated user. */
export const boardsRouter = Router();

boardsRouter.use(requireAuth);

boardsRouter.get('/', async (req, res) => {
  const boards = await boardsService.listBoards(req.userId!);
  res.json({ boards });
});

boardsRouter.post('/', validateBody(createBoardSchema), async (req, res) => {
  const board = await boardsService.createBoard(req.userId!, req.body);
  res.status(201).json({ board });
});

boardsRouter.get('/:boardId', async (req, res) => {
  const board = await boardsService.getBoard(req.params.boardId, req.userId!);
  res.json({ board });
});

boardsRouter.patch('/:boardId', validateBody(updateBoardSchema), async (req, res) => {
  // Explicit cast: the middleware in the chain widens Express' param inference.
  const { boardId } = req.params as { boardId: string };
  const board = await boardsService.updateBoard(boardId, req.userId!, req.body);
  res.json({ board });
});

boardsRouter.delete('/:boardId', async (req, res) => {
  await boardsService.deleteBoard(req.params.boardId, req.userId!);
  res.status(204).end();
});

// Columns are created in the context of their board.
boardsRouter.post('/:boardId/columns', validateBody(createColumnSchema), async (req, res) => {
  const { boardId } = req.params as { boardId: string };
  const column = await columnsService.createColumn(boardId, req.userId!, req.body);
  res.status(201).json({ column });
});

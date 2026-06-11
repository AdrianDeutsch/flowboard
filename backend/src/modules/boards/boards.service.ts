import { prisma } from '../../lib/prisma';
import { HttpError } from '../../errors/HttpError';
import { CreateBoardInput, UpdateBoardInput } from './boards.schemas';

/**
 * Board business logic. Every operation is scoped to the owning user –
 * a foreign board id behaves exactly like a missing one (404), so the
 * API leaks no information about other users' data.
 */

/** Asserts the board exists and belongs to the user; returns it. */
async function findOwnedBoard(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({ where: { id: boardId, ownerId: userId } });
  if (!board) {
    throw HttpError.notFound('Board not found');
  }
  return board;
}

export async function listBoards(userId: string) {
  return prisma.board.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' },
  });
}

export async function createBoard(userId: string, input: CreateBoardInput) {
  return prisma.board.create({
    data: { ...input, ownerId: userId },
  });
}

/** Full board detail: columns and tasks ordered for rendering. */
export async function getBoard(boardId: string, userId: string) {
  const board = await prisma.board.findFirst({
    where: { id: boardId, ownerId: userId },
    include: {
      columns: {
        orderBy: { position: 'asc' },
        include: { tasks: { orderBy: { position: 'asc' } } },
      },
    },
  });
  if (!board) {
    throw HttpError.notFound('Board not found');
  }
  return board;
}

export async function updateBoard(boardId: string, userId: string, input: UpdateBoardInput) {
  await findOwnedBoard(boardId, userId);
  return prisma.board.update({ where: { id: boardId }, data: input });
}

export async function deleteBoard(boardId: string, userId: string) {
  await findOwnedBoard(boardId, userId);
  await prisma.board.delete({ where: { id: boardId } });
}

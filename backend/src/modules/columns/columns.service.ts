import { prisma } from '../../lib/prisma';
import { HttpError } from '../../errors/HttpError';
import { CreateColumnInput, UpdateColumnInput } from './columns.schemas';

/**
 * Column business logic. Ownership is always verified through the
 * parent board before any mutation.
 */

/** Asserts the column exists and its board belongs to the user. */
export async function findOwnedColumn(columnId: string, userId: string) {
  const column = await prisma.column.findFirst({
    where: { id: columnId, board: { ownerId: userId } },
  });
  if (!column) {
    throw HttpError.notFound('Column not found');
  }
  return column;
}

export async function createColumn(boardId: string, userId: string, input: CreateColumnInput) {
  const board = await prisma.board.findFirst({ where: { id: boardId, ownerId: userId } });
  if (!board) {
    throw HttpError.notFound('Board not found');
  }

  // Append at the end of the board.
  const position = await prisma.column.count({ where: { boardId } });
  return prisma.column.create({ data: { ...input, boardId, position } });
}

export async function updateColumn(columnId: string, userId: string, input: UpdateColumnInput) {
  await findOwnedColumn(columnId, userId);
  return prisma.column.update({ where: { id: columnId }, data: input });
}

export async function deleteColumn(columnId: string, userId: string) {
  const column = await findOwnedColumn(columnId, userId);

  // Delete and close the position gap atomically so ordering stays dense.
  await prisma.$transaction([
    prisma.column.delete({ where: { id: columnId } }),
    prisma.column.updateMany({
      where: { boardId: column.boardId, position: { gt: column.position } },
      data: { position: { decrement: 1 } },
    }),
  ]);
}

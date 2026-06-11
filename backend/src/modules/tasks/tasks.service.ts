import { prisma } from '../../lib/prisma';
import { HttpError } from '../../errors/HttpError';
import { CreateTaskInput, MoveTaskInput, UpdateTaskInput } from './tasks.schemas';

/**
 * Task business logic, including the position bookkeeping that backs
 * drag & drop. Positions are dense zero-based integers per column and
 * are re-indexed inside transactions to stay consistent under load.
 */

/** Asserts the task exists and its board belongs to the user. */
async function findOwnedTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, column: { board: { ownerId: userId } } },
    include: { column: true },
  });
  if (!task) {
    throw HttpError.notFound('Task not found');
  }
  return task;
}

export async function createTask(columnId: string, userId: string, input: CreateTaskInput) {
  const column = await prisma.column.findFirst({
    where: { id: columnId, board: { ownerId: userId } },
  });
  if (!column) {
    throw HttpError.notFound('Column not found');
  }

  // Append at the end of the column.
  const position = await prisma.task.count({ where: { columnId } });
  return prisma.task.create({ data: { ...input, columnId, position } });
}

export async function updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
  await findOwnedTask(taskId, userId);
  return prisma.task.update({ where: { id: taskId }, data: input });
}

export async function deleteTask(taskId: string, userId: string) {
  const task = await findOwnedTask(taskId, userId);

  // Delete and close the position gap atomically.
  await prisma.$transaction([
    prisma.task.delete({ where: { id: taskId } }),
    prisma.task.updateMany({
      where: { columnId: task.columnId, position: { gt: task.position } },
      data: { position: { decrement: 1 } },
    }),
  ]);
}

/**
 * Moves a task to `input.position` inside `input.targetColumnId`.
 * Handles both same-column reordering and cross-column moves; all
 * position shifts and the final update run in one transaction.
 */
export async function moveTask(taskId: string, userId: string, input: MoveTaskInput) {
  const task = await findOwnedTask(taskId, userId);

  const targetColumn = await prisma.column.findFirst({
    where: { id: input.targetColumnId, board: { ownerId: userId } },
  });
  if (!targetColumn) {
    throw HttpError.notFound('Target column not found');
  }
  if (targetColumn.boardId !== task.column.boardId) {
    throw HttpError.badRequest('Cannot move a task to a different board');
  }

  const sameColumn = task.columnId === targetColumn.id;
  const targetCount = await prisma.task.count({ where: { columnId: targetColumn.id } });
  // Clamp to a valid index; within the same column the max index is count - 1.
  const maxPosition = sameColumn ? Math.max(targetCount - 1, 0) : targetCount;
  const newPosition = Math.min(input.position, maxPosition);

  if (sameColumn) {
    if (newPosition === task.position) {
      return task;
    }
    const movingDown = newPosition > task.position;
    await prisma.$transaction([
      // Shift the tasks between old and new slot by one in the
      // opposite direction of the move.
      prisma.task.updateMany({
        where: movingDown
          ? { columnId: task.columnId, position: { gt: task.position, lte: newPosition } }
          : { columnId: task.columnId, position: { gte: newPosition, lt: task.position } },
        data: { position: movingDown ? { decrement: 1 } : { increment: 1 } },
      }),
      prisma.task.update({ where: { id: taskId }, data: { position: newPosition } }),
    ]);
  } else {
    await prisma.$transaction([
      // Close the gap in the source column …
      prisma.task.updateMany({
        where: { columnId: task.columnId, position: { gt: task.position } },
        data: { position: { decrement: 1 } },
      }),
      // … make room in the target column …
      prisma.task.updateMany({
        where: { columnId: targetColumn.id, position: { gte: newPosition } },
        data: { position: { increment: 1 } },
      }),
      // … and place the task.
      prisma.task.update({
        where: { id: taskId },
        data: { columnId: targetColumn.id, position: newPosition },
      }),
    ]);
  }

  return prisma.task.findUniqueOrThrow({ where: { id: taskId } });
}

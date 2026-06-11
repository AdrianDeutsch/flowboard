import request from 'supertest';
import { createApp } from '../src/app';
import { prismaMock } from './helpers/prismaMock';
import { authCookie } from './helpers/fixtures';

const app = createApp();

/** Builds a Task row including its column, as findOwnedTask returns it. */
function buildTaskWithColumn(overrides: { columnId?: string; position?: number } = {}) {
  const columnId = overrides.columnId ?? 'col-1';
  return {
    id: 'task-1',
    title: 'Write tests',
    description: null,
    position: overrides.position ?? 0,
    columnId,
    createdAt: new Date(),
    updatedAt: new Date(),
    column: {
      id: columnId,
      title: 'To Do',
      position: 0,
      boardId: 'board-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };
}

const buildColumn = (id: string, boardId = 'board-1') => ({
  id,
  title: 'Done',
  position: 1,
  boardId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('PATCH /api/tasks/:taskId/move', () => {
  it('moves a task across columns and re-indexes both columns', async () => {
    prismaMock.task.findFirst.mockResolvedValue(buildTaskWithColumn({ position: 1 }) as never);
    prismaMock.column.findFirst.mockResolvedValue(buildColumn('col-2') as never);
    prismaMock.task.count.mockResolvedValue(3);
    prismaMock.$transaction.mockResolvedValue([] as never);
    prismaMock.task.findUniqueOrThrow.mockResolvedValue(
      buildTaskWithColumn({ columnId: 'col-2', position: 0 }) as never,
    );

    const res = await request(app)
      .patch('/api/tasks/task-1/move')
      .set('Cookie', authCookie())
      .send({ targetColumnId: 'col-2', position: 0 });

    expect(res.status).toBe(200);
    expect(res.body.task.columnId).toBe('col-2');

    // Source column closes the gap, target column makes room.
    expect(prismaMock.task.updateMany).toHaveBeenCalledWith({
      where: { columnId: 'col-1', position: { gt: 1 } },
      data: { position: { decrement: 1 } },
    });
    expect(prismaMock.task.updateMany).toHaveBeenCalledWith({
      where: { columnId: 'col-2', position: { gte: 0 } },
      data: { position: { increment: 1 } },
    });
    expect(prismaMock.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { columnId: 'col-2', position: 0 },
    });
  });

  it('clamps an out-of-range position to the end of the target column', async () => {
    prismaMock.task.findFirst.mockResolvedValue(buildTaskWithColumn() as never);
    prismaMock.column.findFirst.mockResolvedValue(buildColumn('col-2') as never);
    prismaMock.task.count.mockResolvedValue(2);
    prismaMock.$transaction.mockResolvedValue([] as never);
    prismaMock.task.findUniqueOrThrow.mockResolvedValue(
      buildTaskWithColumn({ columnId: 'col-2', position: 2 }) as never,
    );

    const res = await request(app)
      .patch('/api/tasks/task-1/move')
      .set('Cookie', authCookie())
      .send({ targetColumnId: 'col-2', position: 999 });

    expect(res.status).toBe(200);
    expect(prismaMock.task.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { columnId: 'col-2', position: 2 },
    });
  });

  it('rejects moving a task to a column of a different board', async () => {
    prismaMock.task.findFirst.mockResolvedValue(buildTaskWithColumn() as never);
    prismaMock.column.findFirst.mockResolvedValue(buildColumn('col-9', 'other-board') as never);

    const res = await request(app)
      .patch('/api/tasks/task-1/move')
      .set('Cookie', authCookie())
      .send({ targetColumnId: 'col-9', position: 0 });

    expect(res.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('returns 404 for a task the user does not own', async () => {
    prismaMock.task.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/tasks/task-1/move')
      .set('Cookie', authCookie('intruder'))
      .send({ targetColumnId: 'col-2', position: 0 });

    expect(res.status).toBe(404);
  });
});

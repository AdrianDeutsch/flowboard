import request from 'supertest';
import { createApp } from '../src/app';
import { prismaMock } from './helpers/prismaMock';
import { authCookie, buildBoard } from './helpers/fixtures';

const app = createApp();

describe('/api/boards', () => {
  it('rejects unauthenticated access to every board route', async () => {
    const responses = await Promise.all([
      request(app).get('/api/boards'),
      request(app).post('/api/boards').send({ title: 'X' }),
      request(app).delete('/api/boards/board-1'),
    ]);
    responses.forEach((res) => expect(res.status).toBe(401));
  });

  it('lists only the boards of the authenticated user', async () => {
    prismaMock.board.findMany.mockResolvedValue([buildBoard()]);

    const res = await request(app).get('/api/boards').set('Cookie', authCookie('user-1'));

    expect(res.status).toBe(200);
    expect(res.body.boards).toHaveLength(1);
    expect(prismaMock.board.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { ownerId: 'user-1' } }),
    );
  });

  it('creates a board linked to the authenticated user', async () => {
    prismaMock.board.create.mockResolvedValue(buildBoard({ title: 'Roadmap' }));

    const res = await request(app)
      .post('/api/boards')
      .set('Cookie', authCookie('user-1'))
      .send({ title: 'Roadmap' });

    expect(res.status).toBe(201);
    expect(res.body.board.title).toBe('Roadmap');
    expect(prismaMock.board.create).toHaveBeenCalledWith({
      data: { title: 'Roadmap', ownerId: 'user-1' },
    });
  });

  it('rejects board creation with an empty title', async () => {
    const res = await request(app)
      .post('/api/boards')
      .set('Cookie', authCookie())
      .send({ title: '   ' });

    expect(res.status).toBe(400);
    expect(prismaMock.board.create).not.toHaveBeenCalled();
  });

  it("returns 404 when accessing another user's board", async () => {
    // Scoped query finds nothing for this user -> indistinguishable from missing.
    prismaMock.board.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/boards/board-of-someone-else')
      .set('Cookie', authCookie('user-2'));

    expect(res.status).toBe(404);
  });

  it('deletes an owned board', async () => {
    prismaMock.board.findFirst.mockResolvedValue(buildBoard());
    prismaMock.board.delete.mockResolvedValue(buildBoard());

    const res = await request(app).delete('/api/boards/board-1').set('Cookie', authCookie());

    expect(res.status).toBe(204);
    expect(prismaMock.board.delete).toHaveBeenCalledWith({ where: { id: 'board-1' } });
  });
});

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.router';
import { boardsRouter } from './modules/boards/boards.router';
import { columnsRouter } from './modules/columns/columns.router';
import { tasksRouter } from './modules/tasks/tasks.router';

/**
 * Creates the configured Express application.
 * Kept separate from the listening server so supertest can run
 * requests against it without binding a port.
 */
export function createApp() {
  const app = express();

  // The frontend runs on a different origin in development;
  // credentials must be enabled for the httpOnly auth cookie.
  app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/boards', boardsRouter);
  app.use('/api/columns', columnsRouter);
  app.use('/api/tasks', tasksRouter);

  // Unknown routes -> uniform 404 JSON instead of the HTML default.
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(errorHandler);

  return app;
}

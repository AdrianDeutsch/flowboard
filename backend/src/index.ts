import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

/** Server entry point: boot the app and handle graceful shutdown. */
const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

// Close HTTP server and DB pool cleanly on SIGINT/SIGTERM (Docker, Ctrl+C).
async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down …`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

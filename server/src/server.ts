/**
 * Nivarak API — Server Entry Point
 *
 * Starts the HTTP server, runs DB connection test, seeds roles.
 * Handles graceful shutdown on SIGTERM/SIGINT.
 */

import { serve } from '@hono/node-server';
import { app } from './app.js';
import { config } from './config/index.js';
import { testConnection, closeConnection } from './db/connection.js';
import { seedRoles } from './db/seed.js';
import { logger } from './shared/logger.js';

async function main() {
  logger.info('Nivarak API — Elder Care Platform (modular monolith)');
  logger.info({ env: config.nodeEnv, port: config.port }, 'Starting server...');

  // Test database connection
  const dbConnected = await testConnection();
  if (!dbConnected) {
    logger.warn('Database not connected - server starting in API-only mode');
    logger.warn('Run `npm run db:push` to create tables, and ensure PostgreSQL is running');
  } else {
    // Seed default roles
    try {
      await seedRoles();
    } catch (err) {
      logger.warn({ err }, 'Role seeding skipped (tables may not exist yet)');
    }
  }

  // Start HTTP server
  const server = serve(
    {
      fetch: app.fetch,
      port: config.port,
    },
    (info) => {
      logger.info(`✓ Server running at http://localhost:${info.port}`);
      logger.info(`  Health:  http://localhost:${info.port}/health`);
      logger.info(`  Ready:   http://localhost:${info.port}/health/ready`);
      logger.info(`  API:     http://localhost:${info.port}/api/${config.apiVersion}/`);
    }
  );

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      logger.fatal({ port: config.port }, `Port ${config.port} is already in use`);
      process.exit(1);
    }
    logger.fatal({ err }, 'HTTP server error');
    process.exit(1);
  });

  // ─── Graceful Shutdown ──────────────────────────────────
  let isShuttingDown = false;

  async function shutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info({ signal }, `Received ${signal} — starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close database connection
    try {
      await closeConnection();
      logger.info('Database connection closed');
    } catch (err) {
      logger.error({ err }, 'Error closing database connection');
    }

    logger.info('Graceful shutdown complete');
    process.exit(0);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});

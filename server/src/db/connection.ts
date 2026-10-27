import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from '../config/index.js';
import { logger } from '../shared/logger.js';
import * as schema from './schema/index.js';

/** Long-running Node API: pooled Neon `DATABASE_URL` + postgres.js (see neon-postgres skill). */
const queryClient = postgres(config.db.url, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {},
});

/**
 * Drizzle prints every query with its parameters, which include health answers,
 * names, phone numbers, emails, and access-token hashes. Query logging is
 * therefore opt-in (`DB_QUERY_LOG=true`) and never follows `NODE_ENV` alone,
 * because `isDev` is also true when `NODE_ENV` is unset.
 */
export const db = drizzle(queryClient, {
  schema,
  logger: process.env.DB_QUERY_LOG === 'true' && process.env.VITEST !== 'true',
});

export async function testConnection(): Promise<boolean> {
  try {
    await queryClient`SELECT 1 as health_check`;
    logger.info('Database connection established');
    return true;
  } catch (error) {
    logger.error({ error }, 'Database connection failed');
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  await queryClient.end();
  logger.info('Database connection closed');
}

export { queryClient };

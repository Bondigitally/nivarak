import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { config } from '../config/index.js';
import { logger } from '../shared/logger.js';
import * as schema from './schema/index.js';

const queryClient = postgres(config.db.url, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {},
});

export const db = drizzle(queryClient, { schema, logger: config.isDev });

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

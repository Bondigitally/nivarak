import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://nivarak:nivarak_dev@localhost:5432/nivarak_db',
  },
  verbose: true,
  strict: true,
});

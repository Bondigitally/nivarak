import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'postgres://dummy:dummy@localhost:5432/dummy',
      COGNITO_USER_POOL_ID: 'ap-south-1_dummy',
      COGNITO_CLIENT_ID: 'dummy_client_id',
    },
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/__tests__/**', 'src/db/schema/**', 'src/server.ts'],
    },
    testTimeout: 10000,
  },
});

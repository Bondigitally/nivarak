import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'postgres://dummy:dummy@localhost:5432/dummy',
      COGNITO_USER_POOL_ID: 'ap-south-1_dummy',
      COGNITO_CLIENT_ID: 'dummy_client_id',
      RAZORPAY_KEY_ID: 'rzp_test_local',
      RAZORPAY_KEY_SECRET: 'test_key_secret_local',
      RAZORPAY_WEBHOOK_SECRET: 'test_webhook_secret_local',
      IASP_REPORT_AMOUNT_PAISE: '49900',
    },
    globals: true,
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    exclude: ['src/__tests__/integration/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/__tests__/**', 'src/db/schema/**', 'src/server.ts'],
    },
    testTimeout: 10000,
  },
});

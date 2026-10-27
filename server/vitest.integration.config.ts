import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'postgres://nivarak:nivarak_dev@127.0.0.1:5433/nivarak_db',
      COGNITO_USER_POOL_ID: 'ap-south-1_dummy',
      COGNITO_CLIENT_ID: 'dummy_client_id',
      RAZORPAY_KEY_ID: 'rzp_test_local',
      RAZORPAY_KEY_SECRET: 'test_key_secret_local',
      RAZORPAY_WEBHOOK_SECRET: 'test_webhook_secret_local',
      IASP_REPORT_AMOUNT_PAISE: '49900',
    },
    environment: 'node',
    include: ['src/__tests__/integration/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});

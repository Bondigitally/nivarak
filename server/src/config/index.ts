import 'dotenv/config';

const requiredVars = [
  'DATABASE_URL',
  'COGNITO_USER_POOL_ID',
  'COGNITO_CLIENT_ID',
] as const;

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  isDev: process.env.NODE_ENV !== 'production',

  db: {
    url: process.env.DATABASE_URL!,
  },

  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    clientId: process.env.COGNITO_CLIENT_ID!,
    region:
      process.env.AWS_REGION ||
      process.env.COGNITO_USER_POOL_ID!.split('_')[0] ||
      'ap-south-1',
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localPath: process.env.LOCAL_STORAGE_PATH || './uploads',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? '',
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
    iaspReportAmountPaise: parseInt(
      process.env.IASP_REPORT_AMOUNT_PAISE || '49900',
      10,
    ),
  },
} as const;

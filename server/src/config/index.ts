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
  /**
   * Number of reverse proxies in front of the API that append to
   * X-Forwarded-For. 0 ignores the header and uses the socket address.
   * The default of 1 assumes a single platform proxy; set 0 when the API
   * is reachable directly.
   */
  trustProxyHops: Math.max(0, Number.parseInt(process.env.TRUST_PROXY_HOPS ?? '1', 10) || 0),

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
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
    iaspReportAmountPaise: readIaspReportAmountPaise(),
    iaspReportCurrency: 'INR' as const,
  },
} as const;

function readIaspReportAmountPaise(): number {
  const raw = process.env.IASP_REPORT_AMOUNT_PAISE;
  if (raw == null || raw === '') return 49900;
  const amount = Number(raw);
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error('IASP_REPORT_AMOUNT_PAISE must be a positive integer');
  }
  return amount;
}

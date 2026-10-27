import { config } from '../config/index.js';
import { queryClient } from './connection.js';
import {
  applyIaspLifecycleMigration,
  listUnverifiedUnlockedSessionIds,
} from './iasp-lifecycle-migration.js';

function assertLocalDatabase(url: string): void {
  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch {
    throw new Error('Refusing to migrate: database host is not local');
  }
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && hostname !== '::1') {
    throw new Error('Refusing to migrate: database host is not local');
  }
}

async function main(): Promise<void> {
  assertLocalDatabase(config.db.url);
  await applyIaspLifecycleMigration(queryClient, config.razorpay.iaspReportAmountPaise);
  const ids = await listUnverifiedUnlockedSessionIds(queryClient);
  console.log(`UNVERIFIED_UNLOCKED_SESSION_IDS ${ids.length ? ids.join(',') : 'none'}`);
  await queryClient.end();
}

const isDirect = process.argv[1]?.replaceAll('\\', '/').includes('apply-iasp-lifecycle-migration');
if (isDirect) {
  main().catch((error: unknown) => {
    if (error instanceof Error && error.message.startsWith('Refusing to migrate')) {
      console.error(error.message);
    } else {
      console.error('Migration failed');
    }
    process.exit(1);
  });
}

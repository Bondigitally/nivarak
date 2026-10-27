import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type postgres from 'postgres';

const migrationPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../drizzle/0000_iasp_session_lifecycle.sql',
);

function executableStatements(amountPaise: number): string[] {
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) {
    throw new Error('Report amount must be a positive integer');
  }
  const sqlText = readFileSync(migrationPath, 'utf8').replaceAll(
    '__AMOUNT_PAISE__',
    String(amountPaise),
  );
  return sqlText
    .split('--> statement-breakpoint')
    .map((part) => part.trim())
    .filter((part) =>
      part
        .split('\n')
        .some((line) => {
          const trimmed = line.trim();
          return trimmed.length > 0 && !trimmed.startsWith('--');
        }),
    );
}

export async function applyIaspLifecycleMigration(
  database: postgres.Sql,
  amountPaise: number,
): Promise<void> {
  for (const statement of executableStatements(amountPaise)) {
    await database.unsafe(statement);
  }
}

/** Sessions unlocked before a verified payment row existed. Access is unchanged. */
export async function listUnverifiedUnlockedSessionIds(
  database: postgres.Sql,
): Promise<string[]> {
  const rows = await database<{ id: string }[]>`
    SELECT s.id::text AS id
    FROM iasp_guest_sessions s
    WHERE s.detailed_report_unlocked_at IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM iasp_report_payments p
        WHERE p.session_id = s.id
          AND p.status = 'paid'
          AND p.verified_at IS NOT NULL
      )
    ORDER BY 1
  `;
  return rows.map((row) => row.id);
}

// One-off / repeatable helper: applies prisma/migrations/*/migration.sql files
// directly to a libSQL (Turso) database via @libsql/client, since `prisma
// migrate deploy` cannot connect to libsql:// URLs (its engine only
// understands postgres/mysql/sqlserver/mongodb/file: schemes).
//
// Tracks applied migrations in a local "_manual_migrations" table so it's
// safe to re-run: already-applied migrations are skipped.
//
// Usage: node scripts/apply-migrations-turso.js
// Requires DATABASE_URL and DATABASE_AUTH_TOKEN in the environment (.env).

require('dotenv/config');
const { createClient } = require('@libsql/client');
const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;
  if (!url || !url.startsWith('libsql://')) {
    throw new Error('DATABASE_URL must be a libsql:// URL for this script.');
  }

  const client = createClient({ url, authToken });

  await client.execute(
    'CREATE TABLE IF NOT EXISTS "_manual_migrations" ("name" TEXT PRIMARY KEY, "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)',
  );
  const { rows: appliedRows } = await client.execute(
    'SELECT "name" FROM "_manual_migrations"',
  );
  const applied = new Set(appliedRows.map((r) => r.name));

  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  const dirs = fs
    .readdirSync(migrationsDir)
    .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory())
    .sort();

  let appliedCount = 0;
  for (const dir of dirs) {
    if (applied.has(dir)) {
      console.log(`Skipped (already applied): ${dir}`);
      continue;
    }
    const sqlPath = path.join(migrationsDir, dir, 'migration.sql');
    if (!fs.existsSync(sqlPath)) continue;
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await client.execute(statement);
    }
    await client.execute({
      sql: 'INSERT INTO "_manual_migrations" ("name") VALUES (?)',
      args: [dir],
    });
    console.log(`Applied migration: ${dir}`);
    appliedCount += 1;
  }

  console.log(
    appliedCount > 0
      ? `Done. ${appliedCount} new migration(s) applied.`
      : 'Done. Nothing to apply, already up to date.',
  );
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

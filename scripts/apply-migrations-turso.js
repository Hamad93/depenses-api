// One-off / repeatable helper: applies prisma/migrations/*/migration.sql files
// directly to a libSQL (Turso) database via @libsql/client, since `prisma
// migrate deploy` cannot connect to libsql:// URLs (its engine only
// understands postgres/mysql/sqlserver/mongodb/file: schemes).
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

  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  const dirs = fs
    .readdirSync(migrationsDir)
    .filter((d) => fs.statSync(path.join(migrationsDir, d)).isDirectory())
    .sort();

  for (const dir of dirs) {
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
    console.log(`Applied migration: ${dir}`);
  }

  console.log('All migrations applied.');
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

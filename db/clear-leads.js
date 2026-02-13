import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const confirm = process.env.CONFIRM_DB_CLEAR;
if (confirm !== 'YES') {
  console.error('Refusing to run. Set CONFIRM_DB_CLEAR=YES to proceed.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query('TRUNCATE TABLE contacts RESTART IDENTITY CASCADE');
  console.log('✅ Cleared leads/messages (contacts + cascades).');
} catch (error) {
  console.error('❌ Failed to clear leads/messages:', error?.message || error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createDatabaseIfNotExists = async () => {
  const host = process.env.PGHOST || 'localhost';
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || 'postgres';
  const dbName = process.env.PGDATABASE || 'postgres';
  const port = parseInt(process.env.PGPORT || '5432', 10);

  const sslConfig = process.env.PGSSL === 'true' || (host && host.includes('supabase'))
    ? { rejectUnauthorized: false }
    : false;

  const systemPool = new Pool({
    host,
    user,
    password,
    database: 'postgres',
    port,
    ssl: sslConfig,
  });

  try {
    const res = await systemPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (res.rows.length === 0) {
      console.log(`🔨 Database '${dbName}' does not exist. Creating database...`);
      await systemPool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database '${dbName}' created successfully!`);
    } else {
      console.log(`ℹ️ Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error(`⚠️ Notice during database check/creation: ${err.message}`);
  } finally {
    await systemPool.end();
  }
};

module.exports = createDatabaseIfNotExists;

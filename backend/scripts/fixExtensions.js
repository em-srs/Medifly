const { query, pool } = require('../config/db');

const fixExtensions = async () => {
  try {
    console.log('⚡ Securing Supabase extensions schema...');
    
    // Ensure the extensions schema exists
    await query('CREATE SCHEMA IF NOT EXISTS extensions;');
    
    // Move the pg_trgm extension to the extensions schema
    await query('ALTER EXTENSION pg_trgm SET SCHEMA extensions;');
    
    console.log('✅ pg_trgm extension successfully moved to the "extensions" schema.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error relocating pg_trgm extension:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

fixExtensions();

const { query } = require('../config/db');

async function createIndexes() {
  console.log('⚡ Adding PostgreSQL Indexes for 254,000+ medicines...');
  try {
    // Trigram extension for ultra-fast ILIKE searches, installed in the extensions schema
    await query(`CREATE SCHEMA IF NOT EXISTS extensions;`);
    await query(`CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;`);
    console.log('✅ pg_trgm extension enabled in "extensions" schema');

    // Indexes for fast search & filtering
    await query(`CREATE INDEX IF NOT EXISTS idx_medicines_brand_trgm ON medicines USING gin (brand_name gin_trgm_ops);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_medicines_generic_trgm ON medicines USING gin (generic_name gin_trgm_ops);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_medicines_manufacturer_trgm ON medicines USING gin (manufacturer gin_trgm_ops);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines (category);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_medicines_price ON medicines (price);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_medicines_salt_id ON medicines (salt_id);`);

    console.log('🎉 All PostgreSQL indexes created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating indexes:', err.message);
    process.exit(1);
  }
}

createIndexes();

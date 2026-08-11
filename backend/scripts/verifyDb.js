const { query, pool } = require('../config/db');

const verifyDb = async () => {
  try {
    const tablesRes = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    console.log('📋 Existing SQL Tables in Supabase:');
    tablesRes.rows.forEach(t => console.log(`   - ${t.table_name}`));

    const medCountRes = await query("SELECT COUNT(*) FROM medicines;");
    console.log(`\n📦 Total Medicines in Supabase: ${medCountRes.rows[0].count}`);

    const saltCountRes = await query("SELECT COUNT(*) FROM salts;");
    console.log(`🧂 Total Salts in Supabase: ${saltCountRes.rows[0].count}`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error verifying database:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

verifyDb();

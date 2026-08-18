const { query, pool } = require('../config/db');

const enableRls = async () => {
  const tables = [
    'users',
    'salts',
    'medicines',
    'orders',
    'order_items',
    'pharmacies',
    'prescriptions',
    'riders',
    'subscriptions',
    'subscription_items',
    'support_requests',
    'family_members'
  ];

  console.log('🔐 Enabling Row-Level Security (RLS) on database tables...');

  try {
    for (const table of tables) {
      await query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
      console.log(`   - Enabled RLS on public.${table}`);
    }

    console.log('\n✅ Successfully enabled RLS on all 12 tables!');

    // Let's verify RLS status
    const rlsCheckRes = await query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);

    console.log('\n📊 Row-Level Security Status Verification:');
    rlsCheckRes.rows.forEach(row => {
      console.log(`   - public.${row.tablename}: RLS ${row.rowsecurity ? 'ENABLED (Secure)' : 'DISABLED (Vulnerable)'}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error enabling RLS:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

enableRls();

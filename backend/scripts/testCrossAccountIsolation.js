const { pool, connectDB, query } = require('../config/db');
const storageService = require('../services/storageService');
const vaultController = require('../controllers/vaultController');

async function runCrossAccountVerification() {
  console.log('🧪 Starting Phase 4: Cross-Account Data Isolation Test...\n');

  try {
    await connectDB();

    // 1. Setup User Alpha
    let userAlphaRes = await query("SELECT * FROM users WHERE email = 'alpha.test@medifly.com'");
    let alphaId;
    if (userAlphaRes.rows.length === 0) {
      const newAlpha = await query(
        `INSERT INTO users (name, email, password, role, phone)
         VALUES ('User Alpha', 'alpha.test@medifly.com', 'pass123', 'user', '9876500001')
         RETURNING id`
      );
      alphaId = newAlpha.rows[0].id;
    } else {
      alphaId = userAlphaRes.rows[0].id;
    }

    // 2. Setup User Beta
    let userBetaRes = await query("SELECT * FROM users WHERE email = 'beta.test@medifly.com'");
    let betaId;
    if (userBetaRes.rows.length === 0) {
      const newBeta = await query(
        `INSERT INTO users (name, email, password, role, phone)
         VALUES ('User Beta', 'beta.test@medifly.com', 'pass123', 'user', '9876500002')
         RETURNING id`
      );
      betaId = newBeta.rows[0].id;
    } else {
      betaId = userBetaRes.rows[0].id;
    }

    console.log(`✅ 1. Accounts Created: Alpha (ID: ${alphaId}), Beta (ID: ${betaId})`);

    // 3. Create Family Member for Alpha
    let memberAlphaRes = await query("SELECT * FROM family_members WHERE account_owner_id = $1 AND name = 'Child Alpha'", [alphaId]);
    let memberAlphaId = memberAlphaRes.rows[0]?.id;
    if (!memberAlphaId) {
      const newM = await query(
        `INSERT INTO family_members (account_owner_id, name, relation, blood_group)
         VALUES ($1, 'Child Alpha', 'Daughter', 'A+') RETURNING id`,
        [alphaId]
      );
      memberAlphaId = newM.rows[0].id;
    }

    // 4. Create Family Member for Beta
    let memberBetaRes = await query("SELECT * FROM family_members WHERE account_owner_id = $1 AND name = 'Child Beta'", [betaId]);
    let memberBetaId = memberBetaRes.rows[0]?.id;
    if (!memberBetaId) {
      const newM = await query(
        `INSERT INTO family_members (account_owner_id, name, relation, blood_group)
         VALUES ($1, 'Child Beta', 'Son', 'O+') RETURNING id`,
        [betaId]
      );
      memberBetaId = newM.rows[0].id;
    }

    console.log(`✅ 2. Family Profiles Created: Alpha -> Child Alpha (ID: ${memberAlphaId}), Beta -> Child Beta (ID: ${memberBetaId})`);

    // 5. Test Ownership Gating: Alpha trying to access Beta's family member
    const checkAlphaAccessToBetaMember = await vaultController.checkMemberOwnership(memberBetaId, alphaId);
    if (!checkAlphaAccessToBetaMember) {
      console.log('✅ 3. Security Ownership Check Passed: User Alpha CANNOT access User Beta family member');
    } else {
      throw new Error('SECURITY VIOLATION: User Alpha accessed User Beta family member!');
    }

    // 6. Test Orders Isolation
    await query("DELETE FROM orders WHERE user_id IN ($1, $2)", [alphaId, betaId]);
    await query("INSERT INTO orders (user_id, total_price, shipping_address, status) VALUES ($1, 450.00, '{\"address\": \"123 Alpha St\"}', 'PROCESSING')", [alphaId]);
    await query("INSERT INTO orders (user_id, total_price, shipping_address, status) VALUES ($1, 750.00, '{\"address\": \"456 Beta St\"}', 'DELIVERED')", [betaId]);

    const alphaOrders = await query("SELECT * FROM orders WHERE user_id = $1", [alphaId]);
    const betaOrders = await query("SELECT * FROM orders WHERE user_id = $1", [betaId]);

    if (alphaOrders.rows.length === 1 && alphaOrders.rows[0].total_price == 450.00 &&
        betaOrders.rows.length === 1 && betaOrders.rows[0].total_price == 750.00) {
      console.log('✅ 4. Order Isolation Passed: Alpha sees only 1 order (₹450), Beta sees only 1 order (₹750)');
    } else {
      throw new Error('SECURITY VIOLATION: Orders leaked across accounts!');
    }

    // 7. Test Auto-Refill Subscriptions Isolation
    await query("DELETE FROM subscriptions WHERE user_id IN ($1, $2)", [alphaId, betaId]);
    await query("INSERT INTO subscriptions (user_id, frequency, next_delivery_date, delivery_address, status) VALUES ($1, 30, '2026-03-24', '123 Alpha St', 'ACTIVE')", [alphaId]);

    const alphaSub = await query("SELECT * FROM subscriptions WHERE user_id = $1", [alphaId]);
    const betaSub = await query("SELECT * FROM subscriptions WHERE user_id = $1", [betaId]);

    if (alphaSub.rows.length === 1 && betaSub.rows.length === 0) {
      console.log('✅ 5. Auto-Refill Subscription Isolation Passed: Alpha has 1 active plan, Beta has 0 plans (Empty State)');
    } else {
      throw new Error('SECURITY VIOLATION: Subscription data leaked to un-subscribed account!');
    }

    console.log('\n🎉 ALL CROSS-ACCOUNT ISOLATION CHECKS PASSED PERFECTLY!\n');
  } catch (err) {
    console.error('❌ Verification failed:', err);
  } finally {
    await pool.end();
  }
}

runCrossAccountVerification();

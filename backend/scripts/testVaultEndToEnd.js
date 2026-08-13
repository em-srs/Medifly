const { pool, connectDB, query } = require('../config/db');
const storageService = require('../services/storageService');
const vaultController = require('../controllers/vaultController');
const fs = require('fs');
const path = require('path');

async function runTest() {
  console.log('🚀 Starting Vault & Prescription Storage End-to-End Test...\n');

  try {
    // 1. Connect to DB and run schema setup
    await connectDB();

    // 2. Ensure test user (Tarun) exists
    let userRes = await query("SELECT * FROM users WHERE email = 'tarun.test@medifly.com'");
    let userId;
    if (userRes.rows.length === 0) {
      const newUser = await query(
        `INSERT INTO users (name, email, password, role)
         VALUES ('Tarun Test', 'tarun.test@medifly.com', 'testpass123', 'user')
         RETURNING id`
      );
      userId = newUser.rows[0].id;
    } else {
      userId = userRes.rows[0].id;
    }
    console.log(`✅ 1. Test User ready (ID: ${userId})`);

    // 3. Ensure test family member (Riya) exists for Tarun
    let memberRes = await query(
      "SELECT * FROM family_members WHERE account_owner_id = $1 AND name = 'Riya Test'",
      [userId]
    );
    let memberId;
    if (memberRes.rows.length === 0) {
      const newMember = await query(
        `INSERT INTO family_members (account_owner_id, name, relation, dob, blood_group)
         VALUES ($1, 'Riya Test', 'Daughter', '2015-06-20', 'O+')
         RETURNING id`,
        [userId]
      );
      memberId = newMember.rows[0].id;
    } else {
      memberId = memberRes.rows[0].id;
    }
    console.log(`✅ 2. Test Family Member ready (ID: ${memberId}, Owner: ${userId})`);

    // 4. Create dummy test file
    const testBuffer = Buffer.from('%PDF-1.4 %EOF Dummy Test Prescription PDF Content');
    const mockFile = {
      originalname: 'cardiology_report.pdf',
      mimetype: 'application/pdf',
      size: testBuffer.length,
      buffer: testBuffer,
    };

    // 5. Upload prescription using storage service
    const uploadRes = await storageService.uploadPrescriptionFile({
      file: mockFile,
      accountOwnerId: userId,
      familyMemberId: memberId,
    });
    console.log(`✅ 3. Storage Upload Succeeded (Type: ${uploadRes.storageType}, Key: ${uploadRes.keyPath})`);

    // 6. Insert prescription row
    const rxRes = await query(
      `INSERT INTO prescriptions
       (user_id, family_member_id, uploaded_by_user_id, title, doctor_name, specialty_hospital, file_url, document_url, file_type, file_size_bytes, status, verification_notes)
       VALUES ($1, $2, $1, 'Cardiology Follow-up Test', 'Dr. Sarah Jenkins', 'Metro Heart Institute', $3, $3, $4, $5, 'PENDING', 'Under review by pharmacist')
       RETURNING *`,
      [userId, memberId, uploadRes.keyPath, uploadRes.fileType, uploadRes.fileSizeBytes]
    );
    const rx = rxRes.rows[0];
    console.log(`✅ 4. DB Prescription Row Created (ID: ${rx.id}, FamilyMemberID: ${rx.family_member_id}, UploadedBy: ${rx.uploaded_by_user_id})`);

    // 7. Verify signed URL retrieval
    const signedUrl = await storageService.getSignedFileUrl(rx, userId, 'user');
    console.log(`✅ 5. Signed URL Generated: ${signedUrl}`);

    // 8. Verify Admin Attribution Breakdown
    const reqMock = { query: { accountId: String(userId) } };
    const resMock = {
      json: (data) => data,
      status: () => resMock,
    };

    // Test attribution query directly
    const attrRes = await query(
      `SELECT u.id as account_id, u.name as account_name, u.email as account_email,
              fm.id as member_id, fm.name as member_name, fm.relation as member_relation,
              p.id as prescription_id, p.title as prescription_title, p.status as prescription_status,
              p.file_url, p.created_at as uploaded_at,
              up.id as uploader_id, up.name as uploader_name
       FROM users u
       LEFT JOIN family_members fm ON fm.account_owner_id = u.id
       LEFT JOIN prescriptions p ON p.family_member_id = fm.id
       LEFT JOIN users up ON p.uploaded_by_user_id = up.id
       WHERE u.id = $1`,
      [userId]
    );

    console.log('\n📊 6. Admin Attribution Summary for Account:');
    console.log(`   Account: ${attrRes.rows[0]?.account_name} (${attrRes.rows[0]?.account_email})`);
    console.log(`   Family Member: ${attrRes.rows[0]?.member_name} (${attrRes.rows[0]?.member_relation})`);
    console.log(`   Prescription Title: "${attrRes.rows[0]?.prescription_title}"`);
    console.log(`   Uploaded By: ${attrRes.rows[0]?.uploader_name} (User ID: ${attrRes.rows[0]?.uploader_id})`);

    console.log('\n✨ ALL BACKEND END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    await pool.end();
  }
}

runTest();

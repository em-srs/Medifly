const { query } = require('../config/db');
const storageService = require('../services/storageService');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

// Helper to format family member row
const formatMember = (row) => ({
  id: row.id,
  name: row.name,
  relation: row.relation,
  dob: row.dob || '',
  bloodGroup: row.blood_group || 'A+',
  createdAt: row.created_at,
});

// Helper to format prescription row with dynamic signed URL
const formatPrescription = async (row, requesterUserId, requesterRole) => {
  const signedUrl = await storageService.getSignedFileUrl(row, requesterUserId, requesterRole);
  return {
    id: row.id,
    title: row.title || `Prescription #${row.id}`,
    doctor: row.doctor_name || 'Licensed Doctor',
    spec: row.specialty_hospital || 'General Hospital',
    date: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: row.status || 'PENDING',
    notes: row.verification_notes || row.reviewer_notes || 'Pending Pharmacist Review',
    documentUrl: signedUrl,
    fileUrl: row.file_url,
    fileType: row.file_type || 'image/jpeg',
    fileSizeBytes: row.file_size_bytes ? parseInt(row.file_size_bytes, 10) : 0,
    familyMemberId: row.family_member_id,
    familyMemberName: row.family_member_name || null,
    uploadedByUserId: row.uploaded_by_user_id,
    uploadedByName: row.uploaded_by_name || null,
    verifiedByUserId: row.verified_by_user_id || null,
    verifiedByName: row.verified_by_name || null,
    issuedDate: row.issued_date || null,
    archivedAt: row.archived_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    linkedOrderId: row.linked_order_id || null,
    linkedOrderStatus: row.linked_order_status || null,
  };
};

// Helper to format order row
const formatOrder = (row, items = []) => ({
  id: row.id,
  user: row.user_id,
  familyMemberId: row.family_member_id,
  prescriptionId: row.prescription_id,
  itemsPrice: parseFloat(row.items_price || 0),
  taxPrice: parseFloat(row.tax_price || 0),
  deliveryFee: parseFloat(row.delivery_fee || 0),
  totalPrice: parseFloat(row.total_price || 0),
  isPaid: row.is_paid || false,
  isDelivered: row.is_delivered || false,
  status: row.status || 'processing',
  createdAt: row.created_at,
  shippingAddress: row.shipping_address,
  prescriptionDoc: row.prescription_doc || null,
  orderItems: items.map(item => ({
    id: item.id,
    name: item.name,
    qty: item.qty,
    price: parseFloat(item.price),
    image: item.image,
  }))
});

// Security ownership check helper
const checkMemberOwnership = async (memberId, userId) => {
  const res = await query(
    'SELECT id, account_owner_id, name FROM family_members WHERE id = $1',
    [memberId]
  );
  if (res.rows.length === 0) return null;
  const member = res.rows[0];
  if (member.account_owner_id !== userId) return null;
  return member;
};

exports.checkMemberOwnership = checkMemberOwnership;

// @desc    Get all family members for logged in user (auto-seeds defaults if empty)
// @route   GET /api/vault/members
// @access  Private
exports.getFamilyMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    let result = await query(
      'SELECT * FROM family_members WHERE account_owner_id = $1 ORDER BY id ASC',
      [userId]
    );

    // Auto-seed default family profiles if none exist yet for this account
    if (result.rows.length === 0) {
      const userName = req.user.name || 'Self';
      const defaults = [
        [userId, userName, 'Self', '1990-05-14', 'B+'],
        [userId, `${userName}'s Spouse`, 'Spouse', '1993-08-22', 'O+'],
        [userId, `${userName}'s Father`, 'Father', '1958-03-10', 'A+'],
      ];

      for (const d of defaults) {
        await query(
          'INSERT INTO family_members (account_owner_id, name, relation, dob, blood_group) VALUES ($1, $2, $3, $4, $5)',
          d
        );
      }

      result = await query(
        'SELECT * FROM family_members WHERE account_owner_id = $1 ORDER BY id ASC',
        [userId]
      );
    }

    res.json(result.rows.map(formatMember));
  } catch (error) {
    console.error('Error fetching family members:', error);
    res.status(500).json({ message: 'Server Error fetching family members', error: error.message });
  }
};

// @desc    Add family member
// @route   POST /api/vault/members
// @access  Private
exports.addFamilyMember = async (req, res) => {
  try {
    const { name, relation, dob, bloodGroup } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Family member name is required' });
    }

    const result = await query(
      `INSERT INTO family_members (account_owner_id, name, relation, dob, blood_group)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name.trim(), relation || 'Self', dob || '', bloodGroup || 'A+']
    );

    res.status(201).json(formatMember(result.rows[0]));
  } catch (error) {
    console.error('Error adding family member:', error);
    res.status(500).json({ message: 'Server Error adding family member', error: error.message });
  }
};

// @desc    Update family member
// @route   PUT /api/vault/members/:id
// @access  Private
exports.updateFamilyMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await checkMemberOwnership(memberId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access Denied: Family member does not belong to your account' });
    }

    const { name, relation, dob, bloodGroup } = req.body;
    const result = await query(
      `UPDATE family_members
       SET name = COALESCE($1, name),
           relation = COALESCE($2, relation),
           dob = COALESCE($3, dob),
           blood_group = COALESCE($4, blood_group)
       WHERE id = $5 AND account_owner_id = $6
       RETURNING *`,
      [name, relation, dob, bloodGroup, memberId, req.user.id]
    );

    res.json(formatMember(result.rows[0]));
  } catch (error) {
    console.error('Error updating family member:', error);
    res.status(500).json({ message: 'Server Error updating family member', error: error.message });
  }
};

// @desc    Delete family member
// @route   DELETE /api/vault/members/:id
// @access  Private
exports.deleteFamilyMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await checkMemberOwnership(memberId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access Denied: Family member does not belong to your account' });
    }

    await query(
      'DELETE FROM family_members WHERE id = $1 AND account_owner_id = $2',
      [memberId, req.user.id]
    );

    res.json({ success: true, message: 'Family member removed successfully' });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({ message: 'Server Error deleting family member', error: error.message });
  }
};

// @desc    Get prescriptions for a specific family member (ownership checked)
// @route   GET /api/vault/members/:id/prescriptions
// @access  Private
exports.getMemberPrescriptions = async (req, res) => {
  try {
    const memberId = req.params.id;
    const isElevated = ['pharmacy', 'admin', 'super_admin'].includes(req.user.role);

    if (!isElevated) {
      const member = await checkMemberOwnership(memberId, req.user.id);
      if (!member) {
        return res.status(403).json({ message: 'Access Denied: Family member does not belong to your account' });
      }
    }

    const { archived, status } = req.query;

    let sql = `
      SELECT p.*,
             fm.name as family_member_name,
             u.name as uploaded_by_name,
             v.name as verified_by_name,
             o.id as linked_order_id,
             o.status as linked_order_status
      FROM prescriptions p
      JOIN family_members fm ON p.family_member_id = fm.id
      LEFT JOIN users u ON p.uploaded_by_user_id = u.id
      LEFT JOIN users v ON p.verified_by_user_id = v.id
      LEFT JOIN orders o ON o.prescription_id = p.id
      WHERE p.family_member_id = $1
    `;
    const params = [memberId];

    if (archived === 'true') {
      sql += ' AND p.archived_at IS NOT NULL';
    } else if (archived === 'false' || !archived) {
      sql += ' AND p.archived_at IS NULL';
    }

    if (status) {
      params.push(status.toUpperCase());
      sql += ` AND p.status = $${params.length}`;
    }

    sql += ' ORDER BY p.created_at DESC';

    const result = await query(sql, params);

    const formattedList = await Promise.all(
      result.rows.map(row => formatPrescription(row, req.user.id, req.user.role))
    );

    res.json(formattedList);
  } catch (error) {
    console.error('Error fetching member prescriptions:', error);
    res.status(500).json({ message: 'Server Error fetching prescriptions', error: error.message });
  }
};

// @desc    Upload prescription for a family member (ownership checked, uploaded_by_user_id set to req.user.id)
// @route   POST /api/vault/members/:id/prescriptions
// @access  Private
exports.addMemberPrescription = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await checkMemberOwnership(memberId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access Denied: Family member does not belong to your account' });
    }

    const title = req.body.title || req.body.titleName || 'Prescription Document';
    const doctorName = req.body.doctorName || req.body.doctor_name || '';
    const specialtyHospital = req.body.specialtyHospital || req.body.specialty_hospital || '';
    const issuedDate = req.body.issuedDate || null;

    if (!req.file && !req.body.file_url && !req.body.documentUrl) {
      return res.status(400).json({ message: 'Prescription document file is required (JPG, PNG, or PDF up to 10MB)' });
    }

    let uploadResult;
    if (req.file) {
      uploadResult = await storageService.uploadPrescriptionFile({
        file: req.file,
        accountOwnerId: member.account_owner_id,
        familyMemberId: member.id,
      });
    } else {
      // Fallback if URL is provided directly
      uploadResult = {
        keyPath: req.body.file_url || req.body.documentUrl,
        fileType: 'image/jpeg',
        fileSizeBytes: 1024,
      };
    }

    const result = await query(
      `INSERT INTO prescriptions
       (user_id, family_member_id, uploaded_by_user_id, title, doctor_name, specialty_hospital, file_url, document_url, file_type, file_size_bytes, status, verification_notes, issued_date)
       VALUES ($1, $2, $1, $3, $4, $5, $6, $6, $7, $8, 'PENDING', 'Under review by pharmacist', $9)
       RETURNING *`,
      [
        req.user.id,
        memberId,
        title.trim(),
        doctorName.trim(),
        specialtyHospital.trim(),
        uploadResult.keyPath,
        uploadResult.fileType,
        uploadResult.fileSizeBytes,
        issuedDate,
      ]
    );

    const row = result.rows[0];
    row.family_member_name = member.name;
    row.uploaded_by_name = req.user.name;

    const formatted = await formatPrescription(row, req.user.id, req.user.role);
    res.status(201).json(formatted);
  } catch (error) {
    console.error('Error uploading prescription:', error);
    res.status(400).json({ message: error.message || 'Error uploading prescription' });
  }
};

// @desc    Get signed URL / stream file for a prescription (ownership checked)
// @route   GET /api/vault/prescriptions/:id/file
// @access  Private (or token verified)
exports.getPrescriptionFile = async (req, res) => {
  try {
    const rxId = req.params.id;
    const token = req.query.token;

    let requesterId = req.user?.id;
    let requesterRole = req.user?.role || 'user';
    let keyPathFromToken = null;

    if (token) {
      try {
        const secret = process.env.JWT_SECRET || 'medifly_secret_key_2026';
        const decoded = jwt.verify(token, secret);
        if (String(decoded.prescriptionId) === String(rxId)) {
          requesterId = decoded.requesterUserId;
          requesterRole = decoded.requesterRole;
          keyPathFromToken = decoded.keyPath;
        }
      } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired file access token' });
      }
    }

    if (!requesterId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const rxResult = await query(
      `SELECT p.*, fm.account_owner_id
       FROM prescriptions p
       JOIN family_members fm ON p.family_member_id = fm.id
       WHERE p.id = $1`,
      [rxId]
    );

    if (rxResult.rows.length === 0) {
      return res.status(404).json({ message: 'Prescription file not found' });
    }

    const rx = rxResult.rows[0];
    const isOwner = rx.account_owner_id === requesterId || rx.uploaded_by_user_id === requesterId;
    const isElevated = ['pharmacy', 'admin', 'super_admin'].includes(requesterRole);

    if (!isOwner && !isElevated) {
      return res.status(403).json({ message: 'Access Denied: You do not have permission to view this file' });
    }

    const keyPath = rx.file_url || keyPathFromToken;

    // Check if local file exists to stream
    const parts = keyPath ? keyPath.split('/') : [];
    if (parts.length >= 4 && parts[0] === 'prescriptions') {
      const localFilePath = path.join(storageService.LOCAL_UPLOAD_DIR, parts[1], parts[2], parts[3]);
      if (fs.existsSync(localFilePath)) {
        res.setHeader('Content-Type', rx.file_type || 'image/jpeg');
        return res.sendFile(localFilePath);
      }
    }

    // Otherwise generate and redirect to signed storage URL
    const signedUrl = await storageService.getSignedFileUrl(rx, requesterId, requesterRole);
    if (signedUrl && !signedUrl.includes('/api/vault/prescriptions/')) {
      return res.redirect(signedUrl);
    }

    res.status(404).json({ message: 'Prescription document file not found on storage server' });
  } catch (error) {
    console.error('Error fetching prescription file:', error);
    res.status(500).json({ message: 'Server Error retrieving file', error: error.message });
  }
};

// @desc    Update prescription status (pharmacy/admin only)
// @route   PATCH /api/vault/prescriptions/:id
// @access  Private (pharmacy, admin, super_admin)
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const rxId = req.params.id;
    const { status, notes } = req.body;

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status?.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid status. Must be VERIFIED, REJECTED, or PENDING' });
    }

    const result = await query(
      `UPDATE prescriptions
       SET status = $1,
           verification_notes = $2,
           verified_by_user_id = $3,
           verified_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status.toUpperCase(), notes || 'Updated by reviewer', req.user.id, rxId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Prescription record not found' });
    }

    const formatted = await formatPrescription(result.rows[0], req.user.id, req.user.role);
    res.json({ success: true, prescription: formatted });
  } catch (error) {
    console.error('Error updating prescription status:', error);
    res.status(500).json({ message: 'Server Error updating prescription status', error: error.message });
  }
};

// @desc    Delete prescription (owner or admin only)
// @route   DELETE /api/vault/prescriptions/:id
// @access  Private
exports.deletePrescription = async (req, res) => {
  try {
    const rxId = req.params.id;

    const rxResult = await query(
      `SELECT p.*, fm.account_owner_id
       FROM prescriptions p
       JOIN family_members fm ON p.family_member_id = fm.id
       WHERE p.id = $1`,
      [rxId]
    );

    if (rxResult.rows.length === 0) {
      return res.status(404).json({ message: 'Prescription record not found' });
    }

    const rx = rxResult.rows[0];
    const isOwner = rx.account_owner_id === req.user.id || rx.uploaded_by_user_id === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Access Denied: You do not have permission to delete this prescription' });
    }

    // Delete object from storage
    if (rx.file_url) {
      await storageService.deletePrescriptionFile(rx.file_url);
    }

    // Delete record from database
    await query('DELETE FROM prescriptions WHERE id = $1', [rxId]);

    res.json({ success: true, message: 'Prescription and document file deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({ message: 'Server Error deleting prescription', error: error.message });
  }
};

// @desc    Get admin attribution breakdown (Account -> Family Members -> Prescriptions)
// @route   GET /api/admin/vault/attribution
// @access  Private (admin, super_admin)
exports.getAdminAttribution = async (req, res) => {
  try {
    const accountFilter = req.query.accountId;

    let sql = `
      SELECT u.id as account_id, u.name as account_name, u.email as account_email,
             fm.id as member_id, fm.name as member_name, fm.relation as member_relation,
             p.id as prescription_id, p.title as prescription_title, p.status as prescription_status,
             p.file_url, p.created_at as uploaded_at,
             up.id as uploader_id, up.name as uploader_name
      FROM users u
      LEFT JOIN family_members fm ON fm.account_owner_id = u.id
      LEFT JOIN prescriptions p ON p.family_member_id = fm.id
      LEFT JOIN users up ON p.uploaded_by_user_id = up.id
    `;
    const params = [];

    if (accountFilter) {
      params.push(accountFilter);
      sql += ` WHERE u.id = $1`;
    }

    sql += ` ORDER BY u.id ASC, fm.id ASC, p.id DESC`;

    const result = await query(sql, params);

    // Aggregate into hierarchical account tree structure
    const accountsMap = {};
    for (const row of result.rows) {
      if (!accountsMap[row.account_id]) {
        accountsMap[row.account_id] = {
          accountId: row.account_id,
          accountName: row.account_name,
          accountEmail: row.account_email,
          familyMembers: {},
        };
      }

      if (row.member_id) {
        if (!accountsMap[row.account_id].familyMembers[row.member_id]) {
          accountsMap[row.account_id].familyMembers[row.member_id] = {
            memberId: row.member_id,
            memberName: row.member_name,
            relation: row.member_relation,
            prescriptions: [],
          };
        }

        if (row.prescription_id) {
          accountsMap[row.account_id].familyMembers[row.member_id].prescriptions.push({
            prescriptionId: row.prescription_id,
            title: row.prescription_title,
            status: row.prescription_status,
            fileUrl: row.file_url,
            uploadedAt: row.uploaded_at,
            uploadedBy: {
              userId: row.uploader_id,
              userName: row.uploader_name,
            },
          });
        }
      }
    }

    const formattedAccounts = Object.values(accountsMap).map(acc => ({
      accountId: acc.accountId,
      accountName: acc.accountName,
      accountEmail: acc.accountEmail,
      familyMembers: Object.values(acc.familyMembers),
    }));

    res.json({ success: true, accounts: formattedAccounts });
  } catch (error) {
    console.error('Error fetching admin attribution:', error);
    res.status(500).json({ message: 'Server Error fetching admin attribution', error: error.message });
  }
};

// @desc    Get orders for a specific family member ONLY (ownership checked)
// @route   GET /api/vault/members/:id/orders
// @access  Private
exports.getMemberOrders = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await checkMemberOwnership(memberId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access Denied: Family member does not belong to your account' });
    }

    const ordersResult = await query(
      `SELECT o.*, p.file_url as prescription_doc
       FROM orders o
       LEFT JOIN prescriptions p ON o.prescription_id = p.id
       WHERE o.family_member_id = $1
       ORDER BY o.created_at DESC`,
      [memberId]
    );

    const formattedOrders = [];
    for (const row of ordersResult.rows) {
      const itemsResult = await query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [row.id]
      );
      formattedOrders.push(formatOrder(row, itemsResult.rows));
    }

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching member orders:', error);
    res.status(500).json({ message: 'Server Error fetching orders', error: error.message });
  }
};

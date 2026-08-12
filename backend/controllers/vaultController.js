const { query } = require('../config/db');

// Helper to format family member row
const formatMember = (row) => ({
  id: row.id,
  name: row.name,
  relation: row.relation,
  dob: row.dob || '',
  bloodGroup: row.blood_group || 'A+',
  createdAt: row.created_at,
});

// Helper to format prescription row
const formatPrescription = (row) => ({
  id: row.id,
  title: row.title || `Prescription #${row.id}`,
  doctor: row.doctor_name || 'Licensed Doctor',
  spec: row.doctor_specialty || 'General Physician',
  date: row.upload_date ? new Date(row.upload_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  status: row.status || 'PENDING',
  meds: row.meds_count || 2,
  notes: row.reviewer_notes || 'Pending Pharmacist Review',
  documentUrl: row.document_url,
  familyMemberId: row.family_member_id,
  linkedOrderId: row.linked_order_id || null,
  linkedOrderStatus: row.linked_order_status || null,
});

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

// Security middleware check helper
const checkMemberOwnership = async (memberId, userId) => {
  const res = await query(
    'SELECT id, name FROM family_members WHERE id = $1 AND account_owner_id = $2',
    [memberId, userId]
  );
  return res.rows.length > 0 ? res.rows[0] : null;
};

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
    const member = await checkMemberOwnership(memberId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access Denied: Family member does not belong to your account' });
    }

    const result = await query(
      `SELECT p.*, o.id as linked_order_id, o.status as linked_order_status
       FROM prescriptions p
       LEFT JOIN orders o ON o.prescription_id = p.id
       WHERE p.family_member_id = $1
       ORDER BY p.upload_date DESC`,
      [memberId]
    );

    res.json(result.rows.map(formatPrescription));
  } catch (error) {
    console.error('Error fetching member prescriptions:', error);
    res.status(500).json({ message: 'Server Error fetching prescriptions', error: error.message });
  }
};

// @desc    Upload prescription for a family member (ownership checked)
// @route   POST /api/vault/members/:id/prescriptions
// @access  Private
exports.addMemberPrescription = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await checkMemberOwnership(memberId, req.user.id);
    if (!member) {
      return res.status(403).json({ message: 'Access Denied: Family member does not belong to your account' });
    }

    const { documentUrl, title, doctor, spec } = req.body;
    if (!documentUrl && !title) {
      return res.status(400).json({ message: 'Prescription document or title is required' });
    }

    const docUrl = documentUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600';

    const result = await query(
      `INSERT INTO prescriptions (user_id, family_member_id, document_url, status, reviewer_notes)
       VALUES ($1, $2, $3, 'PENDING', 'Under review by pharmacist')
       RETURNING *`,
      [req.user.id, memberId, docUrl]
    );

    const formatted = formatPrescription(result.rows[0]);
    if (title) formatted.title = title;
    if (doctor) formatted.doctor = doctor;
    if (spec) formatted.spec = spec;

    res.status(201).json(formatted);
  } catch (error) {
    console.error('Error adding prescription:', error);
    res.status(500).json({ message: 'Server Error adding prescription', error: error.message });
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
      `SELECT o.*, p.document_url as prescription_doc
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

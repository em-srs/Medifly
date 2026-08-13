const { query } = require('../config/db');
const jwt = require('jsonwebtoken');

const formatUserProfile = (row) => ({
  id: row.id,
  _id: row.id,
  patientId: `MF-${String(row.id).padStart(5, '0')}-A`,
  name: row.name || 'User',
  email: row.email || '',
  phone: row.phone || '',
  altPhone: row.alt_phone || '',
  bloodGroup: row.blood_group || 'Not specified',
  allergies: row.allergies || 'None reported',
  primaryDoctor: row.primary_doctor || 'Not specified',
  street: row.street || '',
  city: row.city || '',
  state: row.state || '',
  zipCode: row.zip_code || '',
  upiId: row.upi_id || '',
  role: row.role || 'user',
  isSubscribed: row.is_subscribed || false,
  subscriptionPlan: row.subscription_plan || 'none',
  subscriptionExpiry: row.subscription_expiry || null,
  createdAt: row.created_at || new Date().toISOString(),
});

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'medifly_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Get current logged in user profile
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, clerk_id, name, email, phone, alt_phone, blood_group, allergies, primary_doctor, upi_id, role, is_subscribed, subscription_plan, subscription_expiry, street, city, state, zip_code, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.json(formatUserProfile(result.rows[0]));
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server Error fetching user profile', error: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name, phone, altPhone, bloodGroup, allergies,
      primaryDoctor, street, city, state, zipCode, upiId
    } = req.body;

    const result = await query(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           alt_phone = COALESCE($3, alt_phone),
           blood_group = COALESCE($4, blood_group),
           allergies = COALESCE($5, allergies),
           primary_doctor = COALESCE($6, primary_doctor),
           street = COALESCE($7, street),
           city = COALESCE($8, city),
           state = COALESCE($9, state),
           zip_code = COALESCE($10, zip_code),
           upi_id = COALESCE($11, upi_id)
       WHERE id = $12
       RETURNING id, clerk_id, name, email, phone, alt_phone, blood_group, allergies, primary_doctor, upi_id, role, is_subscribed, subscription_plan, subscription_expiry, street, city, state, zip_code, created_at`,
      [
        name !== undefined ? name : null,
        phone !== undefined ? phone : null,
        altPhone !== undefined ? altPhone : null,
        bloodGroup !== undefined ? bloodGroup : null,
        allergies !== undefined ? allergies : null,
        primaryDoctor !== undefined ? primaryDoctor : null,
        street !== undefined ? street : null,
        city !== undefined ? city : null,
        state !== undefined ? state : null,
        zipCode !== undefined ? zipCode : null,
        upiId !== undefined ? upiId : null,
        userId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(formatUserProfile(result.rows[0]));
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server Error updating profile', error: error.message });
  }
};

// @desc    Sync user from Clerk / SSO with PostgreSQL
// @route   POST /api/users/sync
// @access  Public
exports.syncUser = async (req, res) => {
  try {
    const { clerkId, email, name, phone } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'User email is required to sync account' });
    }

    let result = await query(
      'SELECT * FROM users WHERE email = $1 OR clerk_id = $2',
      [email, clerkId || '']
    );

    let userRow;

    if (result.rows.length > 0) {
      userRow = result.rows[0];
      // Update name or clerk_id if missing
      const updated = await query(
        `UPDATE users
         SET clerk_id = COALESCE($1, clerk_id),
             name = COALESCE($2, name),
             phone = CASE WHEN phone = '9876543210' AND $3::text IS NOT NULL AND $3::text != '' THEN $3 ELSE phone END
         WHERE id = $4
         RETURNING id, clerk_id, name, email, phone, alt_phone, blood_group, allergies, primary_doctor, upi_id, role, is_subscribed, subscription_plan, subscription_expiry, street, city, state, zip_code, created_at`,
        [clerkId || userRow.clerk_id, name || userRow.name, phone || null, userRow.id]
      );
      userRow = updated.rows[0];
    } else {
      // Create new user in PostgreSQL
      const newUser = await query(
        `INSERT INTO users (name, email, password, phone, role, clerk_id)
         VALUES ($1, $2, 'clerk_sso_nopassword', $3, 'user', $4)
         RETURNING id, clerk_id, name, email, phone, alt_phone, blood_group, allergies, primary_doctor, upi_id, role, is_subscribed, subscription_plan, subscription_expiry, street, city, state, zip_code, created_at`,
        [name || email.split('@')[0], email, phone || '9876543210', clerkId || email]
      );
      userRow = newUser.rows[0];
    }

    const formatted = formatUserProfile(userRow);
    const token = generateToken(userRow);

    res.json({
      user: formatted,
      token
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Server Error syncing user', error: error.message });
  }
};

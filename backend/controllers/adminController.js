const { query } = require('../config/db');

// @desc    Get administrative dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin or Super_Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const ordersResult = await query('SELECT COUNT(*) FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count, 10);

    const usersResult = await query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    const totalUsers = parseInt(usersResult.rows[0].count, 10);

    const revResult = await query('SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE is_paid = true');
    const totalRevenue = parseFloat(revResult.rows[0].total);

    const lowStockResult = await query('SELECT id, brand_name, inventory_count FROM medicines WHERE inventory_count < 10');
    const lowStockAlerts = lowStockResult.rows;

    res.json({
      success: true,
      stats: {
        orders: totalOrders,
        users: totalUsers,
        revenue: totalRevenue,
        lowStockItems: lowStockAlerts.length
      },
      lowStockDetails: lowStockAlerts.map(med => ({
        id: med.id,
        _id: med.id,
        name: med.brand_name,
        count: med.inventory_count
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving admin stats', error: error.message });
  }
};

// @desc    Get all users visible to the caller's role
// @route   GET /api/admin/users
// @access  Private/Admin or Super_Admin
//
// VISIBILITY RULES (enforced in SQL, never frontend):
//   admin       → sees all users EXCEPT super_admin accounts
//   super_admin → sees ALL users including other super_admins
exports.getAllUsers = async (req, res) => {
  try {
    const callerRole = req.user.role;
    let usersResult;

    if (callerRole === 'super_admin') {
      // Super admin sees every account — no exclusions
      usersResult = await query(
        `SELECT id, name, email, phone, role, is_subscribed, created_at
         FROM users
         ORDER BY created_at DESC`
      );
    } else {
      // Admin sees all users except super_admin accounts
      // This exclusion is enforced at the SQL layer — not a frontend filter
      usersResult = await query(
        `SELECT id, name, email, phone, role, is_subscribed, created_at
         FROM users
         WHERE role != 'super_admin'
         ORDER BY created_at DESC`
      );
    }

    res.json({
      success: true,
      users: usersResult.rows.map(u => ({
        id: u.id,
        _id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: u.role,
        isSubscribed: u.is_subscribed,
        createdAt: u.created_at
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving users', error: error.message });
  }
};

// @desc    Get single user by ID (with role-based visibility)
// @route   GET /api/admin/users/:id
// @access  Private/Admin or Super_Admin
exports.getUserById = async (req, res) => {
  try {
    const callerRole = req.user.role;
    const targetId = req.params.id;

    const result = await query(
      `SELECT id, name, email, phone, alt_phone, blood_group, allergies,
              primary_doctor, role, is_subscribed, subscription_plan,
              street, city, state, zip_code, created_at
       FROM users WHERE id = $1`,
      [targetId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetUser = result.rows[0];

    // Enforce visibility: admin cannot view super_admin accounts
    if (callerRole !== 'super_admin' && targetUser.role === 'super_admin') {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: targetUser.id,
        _id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        phone: targetUser.phone || '',
        altPhone: targetUser.alt_phone || '',
        bloodGroup: targetUser.blood_group || '',
        allergies: targetUser.allergies || '',
        primaryDoctor: targetUser.primary_doctor || '',
        role: targetUser.role,
        isSubscribed: targetUser.is_subscribed,
        subscriptionPlan: targetUser.subscription_plan,
        street: targetUser.street || '',
        city: targetUser.city || '',
        state: targetUser.state || '',
        zipCode: targetUser.zip_code || '',
        createdAt: targetUser.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving user', error: error.message });
  }
};

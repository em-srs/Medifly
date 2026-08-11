const { query } = require('../config/db');

// @desc    Get administrative dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
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

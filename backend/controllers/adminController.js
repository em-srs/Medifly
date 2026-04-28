const Order = require('../models/Order');
const User = require('../models/User');
const Medicine = require('../models/Medicine');

// @desc    Get administrative dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const lowStockAlerts = await Medicine.find({ inventoryCount: { $lt: 10 } });

    res.json({
      success: true,
      stats: {
        orders: totalOrders,
        users: totalUsers,
        revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        lowStockItems: lowStockAlerts.length
      },
      lowStockDetails: lowStockAlerts.map(med => ({
        id: med._id,
        name: med.brandName,
        count: med.inventoryCount
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving admin stats', error: error.message });
  }
};

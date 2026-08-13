const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const { getDashboardStats, getAllUsers, getUserById } = require('../controllers/adminController');

// Admin stats route — accessible by admin + super_admin
router.get('/dashboard', protect, authorize('admin', 'super_admin'), getDashboardStats);

// User management routes — accessible by admin + super_admin
// Visibility is enforced server-side in the controller (admin can't see super_admin)
router.get('/users', protect, authorize('admin', 'super_admin'), getAllUsers);
router.get('/users/:id', protect, authorize('admin', 'super_admin'), getUserById);

module.exports = router;

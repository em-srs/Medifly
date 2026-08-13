const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCurrentUser, updateCurrentUser, syncUser, getUserStats } = require('../controllers/userController');

// Sync user from Clerk / SSO to database
router.post('/sync', syncUser);

// Get current user profile (GET /api/users/me)
router.get('/me', protect, getCurrentUser);

// Get current user stats (GET /api/users/stats)
router.get('/stats', protect, getUserStats);

// Update current user profile (PUT /api/users/me)
router.put('/me', protect, updateCurrentUser);

module.exports = router;

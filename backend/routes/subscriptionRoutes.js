const express = require('express');
const router = express.Router();
const { createSubscription, getMySubscriptions } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createSubscription).get(protect, getMySubscriptions);

module.exports = router;

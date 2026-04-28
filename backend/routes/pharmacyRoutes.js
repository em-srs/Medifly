const express = require('express');
const router = express.Router();
const { registerPharmacy, getPharmacyDashboard } = require('../controllers/pharmacyController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/').post(protect, registerPharmacy);
router.route('/dashboard').get(protect, authorize('pharmacy', 'admin'), getPharmacyDashboard);

module.exports = router;

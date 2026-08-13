const express = require('express');
const router = express.Router();
const { registerRider, updateLocation, getRiderDeliveries } = require('../controllers/riderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/').post(protect, registerRider);
router.route('/location').put(protect, authorize('rider'), updateLocation);
router.route('/deliveries').get(protect, authorize('rider'), getRiderDeliveries);

module.exports = router;


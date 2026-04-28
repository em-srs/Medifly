const express = require('express');
const router = express.Router();
const { registerRider, updateLocation } = require('../controllers/riderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/').post(protect, registerRider);
router.route('/location').put(protect, authorize('rider'), updateLocation);

module.exports = router;

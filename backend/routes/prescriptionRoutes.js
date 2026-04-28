const express = require('express');
const router = express.Router();
const { uploadPrescription, getMyPrescriptions, verifyPrescription } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/').post(protect, uploadPrescription);
router.route('/my').get(protect, getMyPrescriptions);
router.route('/:id/verify').put(protect, authorize('pharmacy', 'admin'), verifyPrescription);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getMedicines, getMedicineById, getAlternatives, compareSalts, updateMedicinePrice } = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

// Route endpoints
router.route('/').get(getMedicines);
router.route('/alternatives/:saltName').get(getAlternatives);
router.route('/salt-comparison/:medicineId').get(compareSalts);
router.route('/:id/price').put(protect, updateMedicinePrice);
router.route('/:id').get(getMedicineById);

module.exports = router;

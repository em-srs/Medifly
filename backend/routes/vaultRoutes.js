const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getMemberPrescriptions,
  addMemberPrescription,
  getMemberOrders,
} = require('../controllers/vaultController');

// All vault routes require authentication
router.use(protect);

// Family Members CRUD
router.get('/members', getFamilyMembers);
router.post('/members', addFamilyMember);
router.put('/members/:id', updateFamilyMember);
router.delete('/members/:id', deleteFamilyMember);

// Member-Scoped Prescriptions & Orders (ownership verified server-side)
router.get('/members/:id/prescriptions', getMemberPrescriptions);
router.post('/members/:id/prescriptions', addMemberPrescription);
router.get('/members/:id/orders', getMemberOrders);

module.exports = router;

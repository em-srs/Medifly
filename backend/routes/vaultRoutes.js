const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Only JPG, PNG, and PDF files are allowed.'), false);
    }
  }
});

const {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  getMemberPrescriptions,
  addMemberPrescription,
  getPrescriptionFile,
  updatePrescriptionStatus,
  deletePrescription,
  getMemberOrders,
} = require('../controllers/vaultController');

// File streaming endpoint (token authorized or authenticated)
router.get('/prescriptions/:id/file', getPrescriptionFile);

// All other vault routes require authentication
router.use(protect);

// Family Members CRUD
router.get('/members', getFamilyMembers);
router.post('/members', addFamilyMember);
router.put('/members/:id', updateFamilyMember);
router.delete('/members/:id', deleteFamilyMember);

// Member-Scoped Prescriptions & Orders (ownership verified server-side)
router.get('/members/:id/prescriptions', getMemberPrescriptions);
router.post('/members/:id/prescriptions', upload.single('file'), addMemberPrescription);
router.get('/members/:id/orders', getMemberOrders);

// Individual Prescription Management
router.patch('/prescriptions/:id', authorize('pharmacy', 'admin', 'super_admin'), updatePrescriptionStatus);
router.delete('/prescriptions/:id', deletePrescription);

module.exports = router;

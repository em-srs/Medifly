const { query } = require('../config/db');

const formatPrescription = (row) => ({
  _id: row.id,
  id: row.id,
  user: row.user_id,
  documentUrl: row.document_url,
  uploadDate: row.upload_date,
  status: row.status,
  reviewerNotes: row.reviewer_notes,
  pharmacist: row.pharmacist_id,
  verifiedAt: row.verified_at,
  createdAt: row.created_at
});

// @desc    Upload new prescription
// @route   POST /api/prescriptions
// @access  Private
exports.uploadPrescription = async (req, res) => {
  try {
    const { documentUrl } = req.body;

    if (!documentUrl) {
      return res.status(400).json({ message: 'No document provided' });
    }

    const result = await query(
      'INSERT INTO prescriptions (user_id, document_url) VALUES ($1, $2) RETURNING *',
      [req.user.id, documentUrl]
    );

    res.status(201).json(formatPrescription(result.rows[0]));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged in user prescriptions
// @route   GET /api/prescriptions/my
// @access  Private
exports.getMyPrescriptions = async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM prescriptions WHERE user_id = $1 ORDER BY upload_date DESC',
      [req.user.id]
    );
    res.json(result.rows.map(formatPrescription));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Verify prescription (Pharmacy/Admin)
// @route   PUT /api/prescriptions/:id/verify
// @access  Private/Pharmacy
exports.verifyPrescription = async (req, res) => {
  try {
    const status = req.body.status || 'VERIFIED';
    const reviewerNotes = req.body.notes || 'Verified by pharmacist';

    const result = await query(
      `UPDATE prescriptions 
       SET status = $1, reviewer_notes = $2, pharmacist_id = $3, verified_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`,
      [status, reviewerNotes, req.user.id, req.params.id]
    );

    if (result.rows.length > 0) {
      const updated = formatPrescription(result.rows[0]);

      // Emit real-time notification to the user
      const { getIo } = require('../socket');
      const io = getIo();
      io.to(updated.user.toString()).emit('prescriptionVerified', {
        prescriptionId: updated._id,
        status: updated.status,
        notes: updated.reviewerNotes
      });

      res.json(updated);
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

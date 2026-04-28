const Prescription = require('../models/Prescription');

// @desc    Upload new prescription
// @route   POST /api/prescriptions
// @access  Private
exports.uploadPrescription = async (req, res) => {
  try {
    // Expected to have multer process the request and add file to req.file
    const { documentUrl } = req.body; 
    
    if(!documentUrl) {
      return res.status(400).json({ message: 'No document provided' });
    }

    const prescription = new Prescription({
      user: req.user._id,
      documentUrl
    });

    const savedPrescription = await prescription.save();
    res.status(201).json(savedPrescription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged in user prescriptions
// @route   GET /api/prescriptions/my
// @access  Private
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Verify prescription (Pharmacy/Admin)
// @route   PUT /api/prescriptions/:id/verify
// @access  Private/Pharmacy
exports.verifyPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if(prescription) {
      prescription.status = req.body.status || 'VERIFIED';
      prescription.reviewerNotes = req.body.notes || 'Verified by pharmacist';
      prescription.pharmacist = req.user._id;
      prescription.verifiedAt = Date.now();

      const updated = await prescription.save();

      // Emit real-time notification to the user
      const { getIo } = require('../socket');
      const io = getIo();
      io.to(prescription.user.toString()).emit('prescriptionVerified', {
        prescriptionId: updated._id,
        status: updated.status,
        notes: updated.reviewerNotes
      });

      res.json(updated);
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch(error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

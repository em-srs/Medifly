const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  documentUrl: { type: String, required: true }, // The S3/Cloud storage or local MULTER path
  uploadDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'REJECTED'], 
    default: 'PENDING' 
  },
  reviewerNotes: { type: String, default: 'Pending Pharmacist Review' },
  pharmacist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Reference to a user with pharmacy role
  },
  verifiedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);

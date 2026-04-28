const mongoose = require('mongoose');

const saltSchema = new mongoose.Schema({
  saltName: { type: String, required: true, unique: true },
  description: { type: String },
  medicalUses: [{ type: String }],
  commonSideEffects: [{ type: String }],
  precautions: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Salt', saltSchema);

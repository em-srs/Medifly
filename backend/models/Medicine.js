const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  medicineId: { type: String, required: true, unique: true },
  brandName: { type: String, required: true },
  genericName: { type: String, required: true },
  
  // Reference to the separate Salts collection for comparison
  saltComposition: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Salt',
    required: true 
  },
  
  category: { type: String, required: true },
  dosageForm: { type: String, required: true },
  strength: { type: String, required: true },
  manufacturer: { type: String, required: true },
  scheduleType: { type: String, enum: ['OTC', 'H', 'H1'], default: 'OTC' },
  requiresPrescription: { type: Boolean, default: false },
  coldChainRequired: { type: Boolean, default: false },
  packSize: { type: String, required: true },
  price: { type: Number, required: true },
  
  // Inventory fields
  stock: { type: Boolean, default: true },
  inventoryCount: { type: Number, default: 50 }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);

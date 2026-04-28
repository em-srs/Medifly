const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    location: {
      lat: Number,
      lng: Number
    }
  },
  inventory: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    stock: { type: Number, default: 0 },
    price: { type: Number }
  }],
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'BANNED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Pharmacy', pharmacySchema);

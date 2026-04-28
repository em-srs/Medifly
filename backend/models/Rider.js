const mongoose = require('mongoose');

const riderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleDetail: {
    make: String,
    model: String,
    registrationNumber: String
  },
  currentLocation: {
    lat: Number,
    lng: Number
  },
  isAvailable: { type: Boolean, default: false },
  status: { type: String, enum: ['OFFLINE', 'ONLINE', 'ON_DELIVERY'], default: 'OFFLINE' },
  activeOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, default: 5.0 }
}, { timestamps: true });

module.exports = mongoose.model('Rider', riderSchema);

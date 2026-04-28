const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicines: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    quantity: { type: Number, default: 1 }
  }],
  frequency: { type: String, enum: ['WEEKLY', 'BIWEEKLY', 'MONTHLY'], required: true },
  nextDeliveryDate: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'CANCELLED'], default: 'ACTIVE' },
  deliveryAddress: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);

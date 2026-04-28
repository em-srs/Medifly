const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String },
      price: { type: Number, required: true },
      medicine: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Medicine',
      },
    },
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true, default: 'Razorpay' },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
  },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  platformFee: { type: Number, required: true, default: 0.0 },
  deliveryFee: { type: Number, required: true, default: 0.0 },
  coldChainFee: { type: Number, required: true, default: 0.0 },
  emergencyFee: { type: Number, required: true, default: 0.0 },
  lateNightFee: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
  status: { type: String, enum: ['pending', 'verified', 'assigned', 'picked_up', 'delivered'], default: 'pending' },
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References rider role
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);

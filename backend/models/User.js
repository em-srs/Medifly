const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'pharmacy', 'rider', 'admin'], default: 'user' },
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
  // Premium Features
  isSubscribed: { type: Boolean, default: false },
  subscriptionPlan: { type: String, enum: ['none', 'monthly', 'yearly'], default: 'none' },
  subscriptionExpiry: { type: Date },
  
  createdAt: { type: Date, default: Date.now }
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

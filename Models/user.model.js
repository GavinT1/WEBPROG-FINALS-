const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  variantId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    lowercase: true,
  },
  // --- FIX 1: CHANGE 'password_hash' TO 'passwordHash' ---
  passwordHash: {
    type: String,
    required: [true, 'Please provide a password hash'],
  },
  // -------------------------------------------------------
  firstName: {
    type: String,
    required: [true, 'Please provide your first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name'],
    trim: true,
  },
  // --- ADDED THIS (Required for checkout) ---s

// ✅ CORRECT (Wrapped in [ square brackets ])
addresses: [ 
    {
        label: { type: String, default: 'Home' },
        address: { type: String, required: true },
        city: { type: String, required: true },
        zip: { type: String },
        isDefault: { type: Boolean, default: false }
    }
],
  
  // ------------------------------------------------
  // --- FIX 2: CHANGE 'phone' TO 'phoneNumber' ---
  phoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  // ----------------------------------------------
  
  isAdmin:{
    type: Boolean,
    default: false,
  },
  cart: [CartItemSchema],

  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpires: {
    type: Date,
  },
}, {
  timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
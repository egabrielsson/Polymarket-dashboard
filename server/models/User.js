const mongoose = require('mongoose');
const { Schema } = mongoose;


const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    // hashed password
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

// Validate email format
UserSchema.path('email').validate(function (value) {
  return /\S+@\S+\.\S+/.test(value);
}, 'Invalid email format');

module.exports = mongoose.model('User', UserSchema);






const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  characterString: {
    type: String,
    required: true,
    unique: true,
    minlength: 16,
    maxlength: 16
  },
  username: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');
const { Schema } = mongoose;



const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    // optional owner: when set the category is user-scoped, otherwise it's a global category
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);

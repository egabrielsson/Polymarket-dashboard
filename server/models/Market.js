const mongoose = require('mongoose');
const { Schema } = mongoose;


const MarketSchema = new Schema({
  polymarketId: {
    // external provider ID 
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  categoryId: {
    // optional reference to a Category document can be null for uncategorized markets
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Market', MarketSchema);

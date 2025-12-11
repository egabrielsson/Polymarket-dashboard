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
  image: {
    // Market image URL from Polymarket
    type: String,
    default: ''
  },
  volume: {
    // Total trading volume
    type: Number,
    default: 0
  },
  outcomes: {
    // Outcome labels and prices, e.g. [{ label: "Yes", price: "0.65" }]
    type: Array,
    default: []
  },
  endDate: {
    // When the market closes
    type: Date,
    default: null
  },
  categoryId: {
    // Optional reference to a Category document (for uncategorized markets)
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Market', MarketSchema);

const mongoose = require('mongoose');
const { Schema } = mongoose;


const WatchlistSchema = new Schema({
  userId: {
    // who is watching 
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  marketId: {
    // which market is being watched
    type: Schema.Types.ObjectId,
    ref: 'Market',
    required: true,
    index: true
  }
}, { timestamps: true });

// Prevent a user from watching the same market multiple times
WatchlistSchema.index({ userId: 1, marketId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', WatchlistSchema);

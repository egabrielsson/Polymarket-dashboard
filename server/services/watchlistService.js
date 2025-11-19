const mongoose = require('mongoose');
// const User = require('../models/User');
// const Market = require('../models/Market');
// const Watchlist = require('../models/Watchlist');

module.exports = {
  
  //Add a market to a user's watchlist.

  async addToWatchlist(userId, marketId) {
     if (!mongoose.Types.ObjectId.isValid(userId)) {
      const err = new Error('Invalid userId');
      err.code = 'BAD_REQUEST';
      throw err;
    }

    if (!mongoose.Types.ObjectId.isValid(marketId)) {
      const err = new Error('Invalid marketId');
      err.code = 'BAD_REQUEST';
      throw err;
    }
    throw new Error('Not implemented: addToWatchlist');
  }
};
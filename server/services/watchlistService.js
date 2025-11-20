
/**
 * This file uses plain Error messages so controllers can map 
 * messages to HTTP statuses.
 */

const mongoose = require('mongoose');
// Mongoose models used by the service
const User = require('../models/User');
const Market = require('../models/Market');
const Watchlist = require('../models/Watchlist');

module.exports = {
  
  // Add a market to a user's watchlist.
  // Prevents duplicates, creates entry, and returns populated market list.

  // Using userId and marketId to connect the market
  // to the personilized wathclist.
  async addToWatchlist(userId, marketId) {
    // Validate that usersId's are valid values for MongoDB 
     if (!mongoose.Types.ObjectId.isValid(userId)) { // isValid checks compatability with mongo
      const err = new Error('Invalid userId');
      err.code = 'BAD_REQUEST'; // error type 400 "invalid request data" 
      throw err;               
    }
    // Validates that the marketsId's are valid.
    if (!mongoose.Types.ObjectId.isValid(marketId)) {
      const err = new Error('Invalid marketId');
      err.code = 'BAD_REQUEST';
      throw err;
    }
    
    // Verify the referenced User exists.
    const user = await User.findById(userID).exec(); // used findByID to look for  the
     if (!user) {                                    // userId
      const err = new Error('User not found');
      err.code = 'NOT_FOUND'; // error type 404 ID not found
      throw err;
    }

    // Verify the referenced Market exists.
    const market = await Market.findById(marketId).exec();
    if (!market) {
      const err = new Error('Market not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    // Prevent duplicates: check if an entry already exists for this user+market.
    const exists = await Watchlist.findOne({ userId, marketId }).exec(); // findOne almost like findById but 
                                                                         // now we only want to find a matching document
                                                                         // and findOne just takes the first document matching the criteria
      if (exists) {  
      const err = new Error('Market already in watchlist');
      err.code = 'DUPLICATE'; // error type 409 unique-constraint / duplicate relationship
      throw err;
    }

    // Create the watchlist relationship.
    await Watchlist.create({ userId, marketId });

    // Return the user's current watchlist as array of populated Market docs.
    const entries = await Watchlist.find({ userId }).populate('marketId').sort({ createdAt: -1 }).exec();
    return entries.map(e => e.marketId);
  }
};
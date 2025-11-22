
/**
 * This file uses plain Error messages so controllers can map 
 * messages to HTTP statuses.
 */

const mongoose = require('mongoose');
// Mongoose models used by the service
const User = require('../models/User');
const Market = require('../models/Market');
const Watchlists = require('../models/Watchlists');


/**
* Helpers function to validate ObjectId's to reduce redundacy
*/
async function ensureUserExists(userId){
    // Validate that usersId's are valid values for MongoDB 
    if(!mongoose.Types.ObjectId.isValid(userId)){ // isValid checks compatability with mongo
        const err = new Error('Invalid userId');
        err.code = 'BAD_REQUEST'; // Error 400 "invalid data"
        throw err;
    }
    // Verify the referenced User exists.
    const user = await User.findById(userId).exec(); // used findByID to look for  the userId                                 
    if (!user) {
        const err = new Error('User not found');
        err.code = 'NOT_FOUND';  // error type 404 ID not found
        throw err;
    }
    return user; // Returns validated user
}


/** 
* This helper function work like the user validator helper functions
* but replaces userId by marketId
*/
async function ensureMarketExists(marketId){
    if(!mongoose.Types.ObjectId.isValid(marketId)){
        const err = new Error('Invalid marketId');
        err.code = 'BAD_REQUEST';
        throw err;
    }
    const market = await Market.findById(marketId).exec();
    if (!market) {
        const err = new Error('Market not found');
        err.code = 'NOT_FOUND';
        throw err;
    }
    return market; // Returns validated market
}


/**
* Helper function to ensure the user-market relation does NOT already exist.
*/
async function ensureWatchlistsNotExists(userId, marketId) {
  const exists = await Watchlists.findOne({ userId, marketId }).lean().exec(); // findOne almost like findById but 
                                                                              // now we only want to find a matching document
                                                                              // and findOne just takes the first document matching the criteria

  if (exists) {         
    const err = new Error('Market already in watchlists');
    err.code = 'DUPLICATE'; // error type 409 unique-constraint / duplicate relationship
    throw err;
  }
  return;
}



module.exports = {

/**
 * Function to remove a market from a user's watchlists
 * checking for ID validations and relation duplication.
 */
async removeFromWatchlists(userId, marketId){
    // Validates ID's of market and user
    await ensureMarketExists(marketId);
    await ensureUserExists(userId);
    // Find existing relation
    const entry = await Watchlists.findOne({ userId, marketId }).exec();
    if (!entry) {
    const err = new Error('Watchlists entry not found');
    err.code = 'NOT_FOUND';
    throw err;
    }

    // Deletes the relation
    await Watchlists.deleteOne({ _id: entry._id});

    // Returns nothing, the controller will send 204 No Content
    return;
},

   
/** 
 * Function to get a user's watchlists
 * that checks for user-validation
 * and returs users markets as an array or empty array
 */
async getUserWatchlists(userId){
    
    // Helper function to validate userId
    await ensureUserExists(userId);

    // Returns users markets
    const entries = await Watchlists.find({ userId })
    .populate('marketId').sort({ createdAt: -1 })
    .exec();

    return entries.map(e => e.marketId);

},

  /** 
  * Add a market to a user's watchlists.
  * Prevents duplicates, creates entry, and returns populated market list.
  * Using userId and marketId to connect the market
  * to the personilized watchist. 
  */
  async addToWatchlists(userId, marketId) {

    // validates ID's and that they exists
    await ensureUserExists(userId); 
    await ensureMarketExists(marketId);
    // Makes sure there is no duplicate relationship
    await ensureWatchlistsNotExists(userId, marketId);

    // Create the watchlists relationship.
    await Watchlists.create({ userId, marketId });

    // Return the user's current watchlists as array of populated Market docs.
    const entries = await Watchlists.find({ userId })
    .populate('marketId').sort({ createdAt: -1 })
    .exec();

    return entries.map(e => e.marketId);
  }
};
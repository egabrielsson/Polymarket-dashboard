
/**
 * This file uses plain Error messages so controllers can map 
 * messages to HTTP statuses.
 */

const mongoose = require('mongoose');
// Mongoose models used by the service
const User = require('../models/User');
const Market = require('../models/Market');
const Watchlist = require('../models/Watchlist');
const { getUserTechCategory } = require('./categoryService');
const { updateMarket } = require('./marketService');


/**
 * Helper to resolve the *external* 16-character user id
 * (stored in `User.characterString`) into the internal Mongo ObjectId.
 *
 * All public Watchlist routes now take the same 16-char id that is
 * returned from the Users endpoints as `id`.
 */
async function ensureUserExists(externalUserId) {
  // Basic sanity check on the 16-char id
  if (
    !externalUserId ||
    typeof externalUserId !== 'string' ||
    externalUserId.length !== 16
  ) {
    const err = new Error('Invalid userId');
    err.code = 'BAD_REQUEST';
    throw err;
  }

  // Look up user by their external id
  const user = await User.findOne({ characterString: externalUserId }).exec();

  if (!user) {
    const err = new Error('User not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  // Return full user document so callers can use user._id for relations
  return user;
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
 * Expects the *internal* Mongo ObjectId for the user.
 */
async function ensureWatchlistNotExists(userMongoId, marketId) {
  const exists = await Watchlist.findOne({ userId: userMongoId, marketId })
    .lean()
    .exec();

  if (exists) {
    const err = new Error('Market already in watchlist');
    err.code = 'DUPLICATE'; // error type 409 unique-constraint / duplicate relationship
    throw err;
  }
  return;
}



module.exports = {

/**
 * Function to remove a market from a user's watchlist
 * checking for ID validations and relation duplication.
 */
async removeFromWatchlist(userId, marketId){
    // Resolve external user id to internal Mongo id and validate both ids
    await ensureMarketExists(marketId);
    const user = await ensureUserExists(userId);

    // Find existing relation using internal user _id
    const entry = await Watchlist.findOne({ userId: user._id, marketId }).exec();
    if (!entry) {
    const err = new Error('Watchlist entry not found');
    err.code = 'NOT_FOUND';
    throw err;
    }

    // Deletes the relation
    await Watchlist.deleteOne({ _id: entry._id});

    // Returns nothing, the controller will send 204 No Content
    return;
},

   
/** 
 * Function to get a user's watchlist
 * that checks for user-validation
 * and returs users markets as an array or empty array
 */
async getUserWatchlist(userId){
    // Resolve external id to internal Mongo id
    const user = await ensureUserExists(userId);

    // Returns users markets for that internal id
    const entries = await Watchlist.find({ userId: user._id })
    .populate('marketId').sort({ createdAt: -1 })
    .exec();

    return entries.map(e => e.marketId);

},

/**
 * Get a single watchlist entry populated with the market document.
 */
async getWatchlistEntry(userId, marketId) {

    const user = await ensureUserExists(userId);
    await ensureMarketExists(marketId);

    const entry = await Watchlist.findOne({ userId: user._id, marketId })
      .populate('marketId')
      .exec();

    if (!entry) {
        const err = new Error('Watchlist entry not found');
        err.code = 'NOT_FOUND';
        throw err;
    }

    return entry.marketId;
},

  /** 
  * Add a market to a user's watchlist.
  * Prevents duplicates, creates entry, and returns populated market list.
  * Using userId and marketId to connect the market
  * to the personilized watchist. 
  * Automatically assigns the market to the user's "Tech" category if not already categorized.
  */
  async addToWatchlist(userId, marketId) {

    // validates ID's and that they exists
    const user = await ensureUserExists(userId); 
    const market = await ensureMarketExists(marketId);
    // Makes sure there is no duplicate relationship
    await ensureWatchlistNotExists(user._id, marketId);

    // If market doesn't have a categoryId, assign it to user's Tech category
    if (!market.categoryId) {
      try {
        const techCategory = await getUserTechCategory(userId);
        // Update the market with the Tech category
        await updateMarket(marketId, { categoryId: techCategory._id });
      } catch (err) {
        // Log error but don't fail watchlist addition if category assignment fails
        console.error('Failed to assign Tech category to market:', err);
      }
    }

    // Create the watchlist relationship using internal user _id.
    await Watchlist.create({ userId: user._id, marketId });

    // Return the user's current watchlist as array of populated Market docs.
    const entries = await Watchlist.find({ userId: user._id })
    .populate('marketId').sort({ createdAt: -1 })
    .exec();

    return entries.map(e => e.marketId);
  }
};
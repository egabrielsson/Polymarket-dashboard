// Market Service
// Handles business logic for creating and managing local Market documents
// A Market stores a reference to an external Polymarket via polymarketId

const Market = require("../models/Market");
const Watchlist = require("../models/Watchlist");
const { fetchMarketById } = require("./polymarketService");

/**
 * Create and store a new Market with polymarketId reference
 * 1. Fetch market data from Polymarket API to validate polymarketId exists
 * 2. Extract exact title (question) from Polymarket response
 * 3. Check for duplicate polymarketId in MongoDB
 * 4. Create and save Market document with Polymarket's exact title and optional categoryId
 *
 * @param {string} polymarketId - External Polymarket ID to reference
 * @param {string} categoryId - Optional Category reference (ObjectId)
 * @returns {object} created Market document with _id, timestamps
 * @throws {Error} if polymarketId is invalid or duplicate
 */
async function createMarket(polymarketId, categoryId = null) {
  // Validate required field
  if (!polymarketId) {
    throw new Error("polymarketId is required");
  }

  // Step 1: Fetch market from Polymarket API to validate and get exact title
  let polymarketData;
  try {
    polymarketData = await fetchMarketById(polymarketId);
  } catch (err) {
    throw new Error(`Invalid polymarketId: ${err.message}`);
  }

  // Extract exact title from Polymarket response
  // Using 'question' field which is the market title/question on Polymarket
  const title = polymarketData.question;

  // Step 2: Check for duplicate polymarketId in MongoDB
  // MongoDB unique index on polymarketId will also enforce this,
  // but we check here to provide a clear 409 error
  // as per good API design practices.
  const existing = await Market.findOne({ polymarketId });
  if (existing) {
    const err = new Error(`Market with polymarketId already exists`);
    err.code = 'DUPLICATE';
    throw err;
  }

  // Step 3: Create and save Market document with the Polymarket data
  const market = new Market({ polymarketId, title, categoryId });
  return await market.save();
}

// List all markets from the database with support for searching, sorting, and pagination
async function listMarkets(filters = {}) {
  // Get the filter values, with sensible defaults if not provided
  const search = filters.search || "";
  const sort = filters.sort || "-createdAt"; // newest first by default
  const limit = Math.min(parseInt(filters.limit || "20", 10), 100); // cap at 100
  const offset = Math.max(parseInt(filters.offset || "0", 10), 0); // no negative offsets

  // Build the MongoDB query, if there is a search term, filter by title
  // The regex with 'i' flag makes it case-insensitive
  // Allowing matches like 'Musk' to find 'musk' etc.
  const query = search ? { title: { $regex: search, $options: "i" } } : {};

  // Run the MongoDB query with all the filtering/sorting/pagination applie
  const markets = await Market.find(query)
    .sort(sort)
    .limit(limit)
    .skip(offset)
    .exec();

  // Count total matches so that we have information about how pagination should behave
  const total = await Market.countDocuments(query);

  return {
    markets,
    total,
    limit,
    offset,
  };
}

// Get a single market by its MongoDB ID
// Returns the market object or throws an error if not found
async function getMarket(marketId) {
  const market = await Market.findById(marketId);
  if (!market) {
    const err = new Error("Market not found");
    err.code = 'NOT_FOUND';
    throw err;
  }
  return market;
}

// Update a market's categoryId field
// Users can recategorize their saved markets for better organization
// In future, users will create custom categories to sort their markets
async function updateMarket(marketId, updates) {
  // Only allow updating categoryId for now
  // polymarketId and title should not be changed to keep data consistency
  const allowedFields = ["categoryId"];
  const updateData = {};

  for (const field of allowedFields) {
    if (field in updates) {
      updateData[field] = updates[field];
    }
  }

  // If no valid fields to update, just return the market as it is
  if (Object.keys(updateData).length === 0) {
    return await getMarket(marketId);
  }

  // Update the market and return the updated document
  const market = await Market.findByIdAndUpdate(marketId, updateData, {
    new: true,
  });

  if (!market) {
    const err = new Error("Market not found");
    err.code = 'NOT_FOUND';
    throw err;
  }

  return market;
}

// Delete a market from the database
// Removes outdated or invalid market entries
async function deleteMarket(marketId) {
  const market = await Market.findByIdAndDelete(marketId);

  if (!market) {
    const err = new Error("Market not found");
    err.code = 'NOT_FOUND';
    throw err;
  }

  return market;
}

// Delete the entire markets collection
async function deleteAllMarkets() {
  await Market.deleteMany({});
  await Watchlist.deleteMany({});
}

// Export the service functions
module.exports = {
  createMarket,
  listMarkets,
  getMarket,
  updateMarket,
  deleteMarket,
  deleteAllMarkets,
};

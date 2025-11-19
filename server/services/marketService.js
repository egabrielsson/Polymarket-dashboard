// Market Service
// Handles business logic for creating and managing local Market documents
// A Market stores a reference to an external Polymarket via polymarketId

const Market = require("../models/Market");
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
    const error = new Error(`Market with polymarketId already exists`);
    error.status = 409; // HTTP Conflict status code
    throw error;
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
// Export the service functions
module.exports = {
  createMarket,
  listMarkets,
};

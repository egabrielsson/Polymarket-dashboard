// Market Service
// Handles business logic for creating and managing local Market documents
// A Market stores a reference to an external Polymarket via polymarketId

const Market = require("../models/Market");
const Watchlist = require("../models/Watchlist");
const { fetchMarketById } = require("./polymarketService");

/**
 * Find a market by its Polymarket ID
 * @param {string} polymarketId - External Polymarket ID
 * @returns {object|null} Market document or null if not found
 */
async function findByPolymarketId(polymarketId) {
  if (!polymarketId) return null;
  return await Market.findOne({ polymarketId });
}

/**
 * Helper to parse array from Polymarket (may be JSON string or array)
 */
function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

/**
 * Transform raw Polymarket data into Market schema format
 * Exported so polymarketController can use it for bulk sync
 */
function transformPolymarketData(pm) {
  const labels = parseArray(pm.outcomes);
  const prices = parseArray(pm.outcomePrices);
  const outcomes = labels.map((label, i) => ({ label, price: prices[i] || '0' }));

  return {
    polymarketId: pm.id,
    title: pm.question || pm.title || 'Untitled',
    image: pm.image || pm.icon || '',
    volume: parseFloat(pm.volume || pm.volumeNum || 0) || 0,
    outcomes,
    endDate: pm.endDate || pm.endDateIso || null
  };
}

/**
 * Create a new Market by fetching data from Polymarket API
 * @param {string} polymarketId - External Polymarket ID
 * @returns {object} Created Market document
 * @throws {Error} if polymarketId is invalid or market already exists
 */
async function createMarket(polymarketId) {
  if (!polymarketId) {
    throw new Error("polymarketId is required");
  }

  // Check for duplicate
  const existing = await Market.findOne({ polymarketId });
  if (existing) {
    const err = new Error("Market already exists");
    err.code = "DUPLICATE";
    throw err;
  }

  // Fetch from Polymarket API
  let polymarketData;
  try {
    polymarketData = await fetchMarketById(polymarketId);
  } catch (err) {
    throw new Error(`Invalid polymarketId: ${err.message}`);
  }

  // Transform and save
  const marketData = transformPolymarketData(polymarketData);
  const market = new Market(marketData);
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
  transformPolymarketData,
  findByPolymarketId,
  createMarket,
  listMarkets,
  getMarket,
  updateMarket,
  deleteMarket,
  deleteAllMarkets,
};

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
// Export the service function to create a new Market
module.exports = {
  createMarket,
};

// This file handles Polymarket-related API requests
// It defines controller functions for various endpoints
// such as fetching markets, searching, and category-specific queries.
// It communicates with the polymarketService for data retrieval
// and syncs markets to MongoDB for local storage.
// The routes for these controllers are defined in routes/polymarket.js

const {
  fetchMarketById,
  searchMarkets,
  getMarketsByTag,
  getTechMarkets,
} = require("../services/polymarketService");
const { transformPolymarketData } = require("../services/marketService");
const Market = require("../models/Market");

/**
 * Upsert markets from Polymarket into MongoDB
 */
async function syncMarketsToMongo(polymarketData) {
  if (!Array.isArray(polymarketData) || polymarketData.length === 0) {
    return;
  }

  const operations = polymarketData.map(pm => ({
    updateOne: {
      filter: { polymarketId: pm.id },
      update: { $set: transformPolymarketData(pm) },
      upsert: true
    }
  }));

  await Market.bulkWrite(operations);
}

/**
 * GET /api/polymarkets/markets/:pmId
 * Fetch a single market by ID
 */
async function getMarket(req, res) {
  try {
    const { pmId } = req.params;

    if (!pmId) {
      return res.status(400).json({ error: "Market ID is required" });
    }

    const market = await fetchMarketById(pmId);
    return res.json({ success: true, data: market });
  } catch (err) {
    if (err.message.includes("Market not found")) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes("rate limited")) {
      return res
        .status(429)
        .json({ error: "Too many requests to Polymarket API" });
    }
    console.error("Error fetching market:", err.message);
    return res
      .status(502)
      .json({ error: "Failed to fetch market from Polymarket" });
  }
}

/**
 * GET /api/polymarkets/markets
 * Search markets with optional query and pagination
 */
async function listMarkets(req, res) {
  try {
    const query = req.query.search || "";
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 200);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    const markets = await searchMarkets(query, limit, offset);
    return res.json({ success: true, data: markets, limit, offset });
  } catch (err) {
    if (err.message.includes("rate limited")) {
      return res
        .status(429)
        .json({ error: "Too many requests to Polymarket API" });
    }
    console.error("Error searching markets:", err.message);
    return res.status(502).json({ error: "Failed to search markets" });
  }
}

//GET /api/polymarkets/categories/:slug/markets
// Fetch markets by category (tag) slug
// slug - category tag slug from Polymarket
async function getMarketsByCategory(req, res) {
  try {
    const { slug } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "100", 10), 20); // Limit the results to 20

    if (!slug) {
      return res.status(400).json({ error: "Category slug is required" }); // If we do not have a category slug, return 400 to the client
    } // Indicating a bad request

    const result = await getMarketsByTag(slug, limit); // Fetch markets by tag from service
    return res.json({ success: true, data: result }); // Return the markets to the client
  } catch (err) {
    if (err.message.includes("Tag not found")) {
      return res.status(404).json({ error: err.message }); // Checks if the tag was not found and returns 404
    }
    if (err.message.includes("rate limited")) {
      // If we are rate limited by Polymarket API, return 429
      return res // To the client
        .status(429)
        .json({ error: "Too many requests to Polymarket API" });
    }
    console.error("Error fetching markets by category:", err.message); // Log any other errors
    return res
      .status(502) // 502 Bad Gateway for other errors
      .json({ error: "Failed to fetch markets by category" });
  }
}

// GET /api/polymarkets/tech-markets
// Fetch only Tech category markets (convenience endpoint)
// A convenience endpoint is used to simplify access to commonly requested data
// Allowing clients to easily retrieve specific datasets without complex queries
// Making it easier when doing frontend development

async function getTechMarketsHandler(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "36", 10), 100);
    const search = req.query.search || "";

    const result = await getTechMarkets(limit, 0, search); // call on service to get tech markets
    
    // Sync fetched markets to MongoDB for local storage
    if (result.markets && result.markets.length > 0) {
      await syncMarketsToMongo(result.markets);
    }
    
    return res.json({ success: true, data: result }); // Return the result as JSON response
  } catch (err) {
    if (err.message.includes("Tag not found")) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes("rate limited")) {
      return res
        .status(429)
        .json({ error: "Too many requests to Polymarket API" });
    }
    console.error("Error fetching tech markets:", err.message);
    return res.status(502).json({ error: "Failed to fetch tech markets" });
  }
}

// Export controller functions
module.exports = {
  getMarket,
  listMarkets,
  getMarketsByCategory,
  getTechMarketsHandler,
};

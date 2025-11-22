// This file handles Polymarket-related API requests
// It defines controller functions for various endpoints
// such as fetching markets, searching, and category-specific queries.
// It communicates with the polymarketService for data retrieval
// and uses fileWriter utility to save debug data when needed.
// The routes for these controllers are defined in routes/polymarket.js

const {
  fetchMarketById,
  searchMarkets,
  getMarketsByTag,
  getTechMarkets,
} = require("../services/polymarketService");
const { writeJsonFile } = require("../utils/fileWriter");

/**
 * GET /api/polymarket/markets/:pmId
 * Fetch a single market by ID
 */
async function getMarket(req, res, next) {
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
 * GET /api/polymarket/markets
 * Search markets with optional query and pagination
 */
async function listMarkets(req, res, next) {
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

//GET /api/polymarket/categories/:slug/markets
// Fetch markets by category (tag) slug
// slug - category tag slug from Polymarket
async function getMarketsByCategory(req, res, next) {
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

// GET /api/polymarket/tech-markets
// Fetch only Tech category markets (convenience endpoint)
// A convenience endpoint is used to simplify access to commonly requested data
// Allowing clients to easily retrieve specific datasets without complex queries
// Making it easier when doing frontend development

async function getTechMarketsHandler(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 20);

    const result = await getTechMarkets(limit); // call on service to get tech markets
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

// GET /api/polymarket/tech-markets/debug
// Fetch tech markets and save to a JSON file for inspection
// Beneficial for debuggning and development purposes
// we can see what data is returned from Polymarket API
// and decide what we actually want to use

async function getTechMarketsDebug(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 20);

    const result = await getTechMarkets(limit);

    // Write to file for inspection
    const timestamp = new Date().toISOString(); // current timestamp
    const debugData = {
      timestamp,
      limit,
      marketCount: result.markets ? result.markets.length : 0,
      tag: result.tag,
      markets: result.markets,
    };

    const filePath = writeJsonFile("tech-markets-debug.json", debugData); // File write to debug folder

    // return response with file path and data
    return res.json({
      success: true,
      message: `Markets saved to: server/debug/tech-markets-debug.json`,
      filePath,
      data: debugData,
    });
  } catch (err) {
    if (err.message.includes("Tag not found")) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes("rate limited")) {
      return res
        .status(429)
        .json({ error: "Too many requests to Polymarket API" });
    }
    console.error("Error fetching tech markets (debug):", err.message);
    return res.status(502).json({ error: "Failed to fetch tech markets" });
  }
}

// Export controller functions
module.exports = {
  getMarket,
  listMarkets,
  getMarketsByCategory,
  getTechMarketsHandler,
  getTechMarketsDebug,
};

// Market Controller
// Handles HTTP requests for Market endpoints
// Validates user input, calls service layer, and returns appropriate HTTP responses

// this const helps us call the service layer functions
const { createMarket, listMarkets, getMarket, updateMarket } = require("../services/marketService");

/**
 * POST /api/markets
 * Create and store a new Market with polymarketId reference
 *
 * Request body:
 * {
 *   "polymarketId": "516950",                    // required: external Polymarket ID
 *   "categoryId": "507f1f77bcf86cd799439011"   // optional: user's local category
 * }
 *
 * Responses:
 * - 201 Created: Market successfully stored in MongoDB
 * - 400 Bad Request: Missing polymarketId or invalid polymarketId
 * - 409 Conflict: polymarketId already exists (duplicate)
 * - 500 Internal Server Error: Unexpected error
 */

// A HTTP handler to create a new Market
async function createMarketHandler(req, res) {
  try {
    // Extract fields from request body
    const { polymarketId, categoryId } = req.body;

    // Validate required field is present
    if (!polymarketId) {
      return res.status(400).json({
        error: "polymarketId is required",
      });
    }

    // Call service layer to create market
    const market = await createMarket(polymarketId, categoryId);

    // Return 201 Created with saved market data
    return res.status(201).json({
      success: true,
      message: "Market created successfully",
      data: market,
    });
  } catch (err) {
    // Handle 409 Conflict (duplicate polymarketId)
    if (err.status === 409) {
      return res.status(409).json({
        error: err.message,
      });
    }

    // Handle 400 Bad Request (invalid polymarketId on Polymarket API)
    if (err.message.includes("Invalid polymarketId")) {
      return res.status(400).json({
        error: err.message,
      });
    }

    // Handle unexpected errors (500 Internal Server Error)
    console.error("Error creating market:", err.message);
    return res.status(500).json({
      error: "Failed to create market",
    });
  }
}

// HTTP handler for GET /api/markets
// Takes query parameters from the URL and passes them to the service layer
// Returns a list of markets with pagination info
async function listMarketsHandler(req, res) {
  try {
    // Extract the query parameters from the URL
    // If they're not provided, we use sensible defaults in the service
    const filters = {
      search: req.query.search || "",
      sort: req.query.sort || "-createdAt",
      limit: req.query.limit || "20",
      offset: req.query.offset || "0",
    };

    // Call the service to get the markets
    const result = await listMarkets(filters);

    // Return the results with pagination metadata
    // hasMore tells the frontend if there are more results to fetch
    return res.status(200).json({
      success: true,
      data: result.markets,
      pagination: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.offset + result.limit < result.total,
      },
    });
  } catch (err) {
    console.error("Error listing markets:", err.message);
    return res.status(500).json({
      error: "Failed to list markets",
    });
  }
}

// Get a single market by its MongoDB ID
async function getMarketHandler(req, res) {
  try {
    // Extract the market ID from the URL parameter
    const { id } = req.params;

    // Call the service to fetch the market
    const market = await getMarket(id);

    // Return 200 OK with the market data
    return res.status(200).json({
      success: true,
      data: market,
    });
  } catch (err) {
    // Handle 404 Not Found when market doesn't exist
    if (err.status === 404) {
      return res.status(404).json({
        error: err.message,
      });
    }

    console.error("Error getting market:", err.message);
    return res.status(500).json({
      error: "Failed to get market",
    });
  }
}

// Update a market's categoryId field
// Allows users to recategorize their saved markets as they organize their watchlist
async function updateMarketHandler(req, res) {
  try {
    // Extract the market ID from the URL parameter
    const { id } = req.params;

    // Extract the update fields from the request body
    const updates = req.body;

    // Call the service to update the market
    const market = await updateMarket(id, updates);

    // Return 200 OK with the updated market data
    return res.status(200).json({
      success: true,
      data: market,
    });
  } catch (err) {
    // Handle 404 Not Found when market doesn't exist
    if (err.status === 404) {
      return res.status(404).json({
        error: err.message,
      });
    }

    console.error("Error updating market:", err.message);
    return res.status(500).json({
      error: "Failed to update market",
    });
  }
}

// export the controller handlers
module.exports = {
  createMarketHandler,
  listMarketsHandler,
  getMarketHandler,
  updateMarketHandler,
};

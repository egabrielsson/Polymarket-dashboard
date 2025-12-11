// Market Controller
// Handles HTTP requests for Market endpoints
// Validates user input, calls service layer, and returns appropriate HTTP responses

// this const helps us call the service layer functions
const {
  findByPolymarketId,
  createMarket,
  listMarkets,
  getMarket,
  updateMarket,
  deleteMarket,
  deleteAllMarkets,
} = require("../services/marketService");

/**
 * POST /api/markets (idempotent)
 * Returns existing market if found, creates new one if not
 *
 * Request body:
 * {
 *   "polymarketId": "516950"  // required: external Polymarket ID
 * }
 *
 * Responses:
 * - 200 OK: Market already exists, returned existing
 * - 201 Created: Market successfully created
 * - 400 Bad Request: Missing or invalid polymarketId
 * - 500 Internal Server Error: Unexpected error
 */

// A HTTP handler to get or create a Market (idempotent from client perspective)
// Returns existing market if found, creates new one if not
async function createMarketHandler(req, res) {
  try {
    const { polymarketId } = req.body;

    if (!polymarketId) {
      return res.status(400).json({
        error: "polymarketId is required",
      });
    }

    // Try to find existing market first
    const existing = await findByPolymarketId(polymarketId);
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Market already exists",
        data: existing,
      });
    }

    // Create new market
    const market = await createMarket(polymarketId);
    return res.status(201).json({
      success: true,
      message: "Market created successfully",
      data: market,
    });
  } catch (err) {
    if (err.message.includes("Invalid polymarketId")) {
      return res.status(400).json({
        error: err.message,
      });
    }

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
    if (err && err.code === 'NOT_FOUND') {
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
    if (err && err.code === 'NOT_FOUND') {
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

// Delete a market from the database
// Removes outdated or invalid market entries
async function deleteMarketHandler(req, res) {
  try {
    // Extract the market ID from the URL parameter
    const { id } = req.params;

    // Call the service to delete the market
    await deleteMarket(id);

    // Return 204 No Content on successful deletion
    return res.status(204).send();
  } catch (err) {
    // Handle 404 Not Found when market doesn't exist
    if (err && err.code === 'NOT_FOUND') {
      return res.status(404).json({
        error: err.message,
      });
    }

    console.error("Error deleting market:", err.message);
    return res.status(500).json({
      error: "Failed to delete market",
    });
  }
}

// Delete the entire markets collection
async function deleteAllMarketsHandler(req, res) {
  try {
    await deleteAllMarkets();
    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting all markets:", err.message);
    return res.status(500).json({
      error: "Failed to delete all markets",
    });
  }
}

// export the controller handlers
module.exports = {
  createMarketHandler,
  listMarketsHandler,
  getMarketHandler,
  updateMarketHandler,
  deleteMarketHandler,
  deleteAllMarketsHandler,
};

// Market Controller
// Handles HTTP requests for Market endpoints
// Validates user input, calls service layer, and returns appropriate HTTP responses

// this const helps us call the service layer function to create markets
const { createMarket } = require("../services/marketService");

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

// export the controller handler
module.exports = {
  createMarketHandler,
};

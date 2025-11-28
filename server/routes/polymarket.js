// This file defines the routes for Polymarket-related API endpoints
// Main use cases include fetching markets, searching, and category-specific queries.
// the routes enables communication between client requests and polymarketController functions.
// It imports controller functions from polymarketController.js to handle the logic.

const express = require("express");

// Import controller functions from polymarketController.js
// So that we can map routes to their handlers
const {
  getMarket,
  listMarkets,
  getMarketsByCategory,
  getTechMarketsHandler,
} = require("../controllers/polymarketController");

// a constant router to define the routes
const router = express.Router();

// GET /api/polymarkets/markets
// List all markets or search with optional query and pagination
// Query params: ?search=<term>&limit=50&offset=0
router.get("/markets", listMarkets);

// GET /api/polymarkets/markets/:pmId
// Get a single market by Polymarket ID
router.get("/markets/:pmId", getMarket);

// GET /api/polymarkets/tech-markets
// Get Tech category markets only (convenience endpoint)
// Query params: ?limit=100
router.get("/tech-markets", getTechMarketsHandler);

// GET /api/polymarkets/categories/:slug/markets
// Get markets for a specific category (tag slug)
// Query params: ?limit=100

router.get("/categories/:slug/markets", getMarketsByCategory);

// export the router to be used later
module.exports = router;

// Market Routes
// Maps HTTP routes to Market controller handlers
// Routes are mounted at /api/markets in app.js

const express = require("express");
const {
  createMarketHandler,
  listMarketsHandler,
  getMarketHandler,
  updateMarketHandler,
  deleteMarketHandler,
} = require("../controllers/marketController");

const router = express.Router();

/**
 * POST /api/markets
 * Create and store a new Market with polymarketId reference
 *
 * Example request:
 * POST http://localhost:3000/api/markets
 * {
 *   "polymarketId": "516950"
 * }
 * Example response (201 Created):
 * {
 *   "success": true,
 *   "message": "Market created successfully",
 *   "data": {
 *     "_id": "691ccdbad790228f2c7f8846",
 *     "polymarketId": "516950",
 *     "title": "Kraken IPO in 2025?",
 *     "categoryId": null,
 *     "createdAt": "2025-11-18T19:49:14.130Z",
 *     "updatedAt": "2025-11-18T19:49:14.130Z"
 *   }
 * }
 */
router.post("/", createMarketHandler);

// GET /api/markets - list all markets with optional search, sort, and pagination
// Frontend can use this to show all saved markets and let users search or filter them
// Query parameters: search, sort, limit, offset
// Returns array of markets with pagination info (total, hasMore, etc)
router.get("/", listMarketsHandler);

// GET /api/markets/:id - get a single market by its MongoDB ID
// Returns the full market object or 404 if not found
router.get("/:id", getMarketHandler);

// PATCH /api/markets/:id - partially update a market's fields
// Allows updating categoryId for organizing markets
// Future: users will create custom categories to organize their saved markets
router.patch("/:id", updateMarketHandler);

// DELETE /api/markets/:id - delete a market from the database
// Removes outdated or invalid market entries
router.delete("/:id", deleteMarketHandler);

module.exports = router;

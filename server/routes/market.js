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
  deleteAllMarketsHandler,
} = require("../controllers/marketController");
const {
  createNoteHandler,
  listNotesHandler,
} = require("../controllers/noteController");

const ADMIN_DELETE_TOKEN = process.env.ADMIN_DELETE_TOKEN || ''

const router = express.Router();

function requireAdminDeleteToken(req, res, next) {
  if (!ADMIN_DELETE_TOKEN) {
    return res.status(503).json({ error: 'Admin delete is not configured.' })
  }

  const providedToken = req.header('x-admin-token') || req.query.adminToken
  if (providedToken !== ADMIN_DELETE_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized admin access' })
  }

  next()
}

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

// DELETE /api/markets - delete the entire markets collection
router.delete("/", requireAdminDeleteToken, deleteAllMarketsHandler);

// Nested Note Routes
// POST /api/markets/:marketId/notes - create a note for a market
router.post("/:marketId/notes", createNoteHandler);

// GET /api/markets/:marketId/notes - list all notes for a market
router.get("/:marketId/notes", listNotesHandler);

module.exports = router;

// Market Routes
// Maps HTTP routes to Market controller handlers
// Routes are mounted at /api/markets in app.js

const express = require("express");
const { createMarketHandler } = require("../controllers/marketController");

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

module.exports = router;

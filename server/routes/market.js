// Market Routes
// Maps HTTP routes to Market controller handlers
// Routes are mounted at /api/markets in app.js

const express = require("express");
const noteRoutes = require("./note");

const router = express.Router();

// Mount note routes as sub-routes: /api/markets/:marketId/notes
router.use("/:marketId/notes", noteRoutes);

module.exports = router;

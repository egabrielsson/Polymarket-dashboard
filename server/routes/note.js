// Note Routes
// Maps HTTP routes to Note controller handlers
// Routes are mounted at /api/markets/:marketId/notes in app.js

const express = require("express");
const { createNoteHandler } = require("../controllers/noteController");

const router = express.Router({ mergeParams: true });

// POST /api/markets/:marketId/notes - create a note for a market
// Returns 201 Created with the created note
router.post("/", createNoteHandler);

module.exports = router;

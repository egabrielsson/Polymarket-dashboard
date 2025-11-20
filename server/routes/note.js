// Note Routes
// Maps HTTP routes to Note controller handlers
// Routes are mounted at /api/markets/:marketId/notes in app.js

const express = require("express");
const {
  createNoteHandler,
  listNotesHandler,
} = require("../controllers/noteController");

const router = express.Router({ mergeParams: true });

// GET /api/markets/:marketId/notes - list all notes for a market
// Returns all notes linked to that market, sorted by newest first
// Returns empty array if no notes exist
router.get("/", listNotesHandler);

// POST /api/markets/:marketId/notes - create a note for a market
// Returns 201 Created with the created note
router.post("/", createNoteHandler);

module.exports = router;

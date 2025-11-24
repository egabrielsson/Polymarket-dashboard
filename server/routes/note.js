// Note Routes
// Maps HTTP routes to Note controller handlers
// Routes are mounted at /api/markets/:marketId/notes in app.js for nested routes
// And at /api/notes/:id for direct note operations

const express = require("express");
const {
  createNoteHandler,
  listNotesHandler,
  updateNoteHandler,
  deleteNoteHandler,
} = require("../controllers/noteController");

const router = express.Router({ mergeParams: true });

// GET /api/markets/:marketId/notes - list all notes for a market
// Returns all notes linked to that market, sorted by newest first
// Returns empty array if no notes exist
router.get("/", listNotesHandler);

// POST /api/markets/:marketId/notes - create a note for a market
// Returns 201 Created with the created note
router.post("/", createNoteHandler);

// PUT /api/notes/:id - update a note's content
// Only the note owner can update it
// Request body: { userId, content }
// Returns 200 OK with the updated note
router.put("/:id", updateNoteHandler);

// DELETE /api/notes/:id - delete a note
// Only the note owner can delete it
// Request body: { userId }
// Returns 204 No Content on success
router.delete("/:id", deleteNoteHandler);

module.exports = router;

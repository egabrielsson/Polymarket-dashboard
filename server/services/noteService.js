// Note Service
// Handles business logic for creating and managing Notes linked to Markets

const Note = require("../models/Note");

// Create a new note for a market
// Stores userId, marketId, and the note content
// User must be authenticated to create a note
async function createNote(userId, marketId, content) {
  // Validate required fields
  if (!userId || !marketId || !content) {
    throw new Error("userId, marketId, and content are required");
  }

  // Create and save the note
  const note = new Note({ userId, marketId, content });
  return await note.save();
}

// List all notes for a specific market
// Returns all notes linked to that market, sorted by newest first
async function listNotesByMarket(marketId) {
  // Validate marketId is provided
  if (!marketId) {
    throw new Error("marketId is required");
  }

  // Find all notes for this market and sort by most recent
  const notes = await Note.find({ marketId }).sort("-createdAt").exec();

  return notes;
}

// Export the service functions
module.exports = {
  createNote,
  listNotesByMarket,
};

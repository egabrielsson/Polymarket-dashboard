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

// Update a note's content
// Only the note owner can update it
// Returns the updated note
async function updateNote(noteId, userId, content) {
  // Validate required fields
  if (!noteId || !userId || !content) {
    throw new Error("noteId, userId, and content are required");
  }

  // Find the note first to check ownership
  const note = await Note.findById(noteId);

  if (!note) {
    const error = new Error("Note not found");
    error.status = 404;
    throw error;
  }

  // Check if the user owns this note
  if (note.userId.toString() !== userId.toString()) {
    const error = new Error("Only the note owner can update this note");
    error.status = 403;
    throw error;
  }

  // Update the note content and return the updated document
  note.content = content;
  return await note.save();
}

// Export the service functions
module.exports = {
  createNote,
  listNotesByMarket,
  updateNote,
};

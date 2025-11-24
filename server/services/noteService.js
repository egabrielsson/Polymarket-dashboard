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
    const err = new Error("Note not found");
    err.code = 'NOT_FOUND';
    throw err;
  }

  // Check if the user owns this note
  if (note.userId.toString() !== userId.toString()) {
    const err = new Error("Only the note owner can update this note");
    err.code = 'FORBIDDEN';
    throw err;
  }

  // Update the note content and return the updated document
  note.content = content;
  return await note.save();
}

// Delete a note
// Only the note owner can delete it
async function deleteNote(noteId, userId) {
  // Validate required fields
  if (!noteId || !userId) {
    throw new Error("noteId and userId are required");
  }

  // Find the note first to check ownership
  const note = await Note.findById(noteId);

  if (!note) {
    const err = new Error("Note not found");
    err.code = 'NOT_FOUND';
    throw err;
  }

  // Check if the user owns this note
  if (note.userId.toString() !== userId.toString()) {
    const err = new Error("Only the note owner can delete this note");
    err.code = 'FORBIDDEN';
    throw err;
  }

  // Delete the note
  return await Note.findByIdAndDelete(noteId);
}

// Export the service functions
module.exports = {
  createNote,
  listNotesByMarket,
  updateNote,
  deleteNote,
};

// Note Controller
// Handles HTTP requests for Note endpoints
// Validates user input, calls service layer, and returns appropriate HTTP responses

const {
  createNote,
  listNotesByMarket,
  updateNote,
} = require("../services/noteService");

// Create a note for a specific market
// User must be authenticated (userId from auth middleware/request)
async function createNoteHandler(req, res) {
  try {
    // Extract userId from authenticated request
    // In a real app, this comes from a JWT token or session
    // For now, we expect it in the request body or from middleware
    const { userId } = req.body;
    const { marketId } = req.params;
    const { content } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    if (!marketId) {
      return res.status(400).json({
        error: "marketId is required",
      });
    }

    if (!content) {
      return res.status(400).json({
        error: "content is required",
      });
    }

    // Call service layer to create note
    const note = await createNote(userId, marketId, content);

    // Return 201 Created with the saved note
    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (err) {
    console.error("Error creating note:", err.message);
    return res.status(500).json({
      error: "Failed to create note",
    });
  }
}

// List all notes for a specific market
// Returns notes sorted by newest first
async function listNotesHandler(req, res) {
  try {
    // Extract the market ID from the URL parameter
    const { marketId } = req.params;

    // Validate marketId
    if (!marketId) {
      return res.status(400).json({
        error: "marketId is required",
      });
    }

    // Call service layer to get notes
    const notes = await listNotesByMarket(marketId);

    // Return 200 OK with the notes array (can be empty)
    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (err) {
    console.error("Error listing notes:", err.message);
    return res.status(500).json({
      error: "Failed to list notes",
    });
  }
}

// Update a note's content
// Only the note owner can update it
async function updateNoteHandler(req, res) {
  try {
    // Extract note ID from URL parameter
    const { id } = req.params;

    // Extract userId and updated content from request body
    const { userId, content } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    if (!content) {
      return res.status(400).json({
        error: "content is required",
      });
    }

    // Call service layer to update the note
    const note = await updateNote(id, userId, content);

    // Return 200 OK with the updated note
    return res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    // Handle 404 Not Found
    if (err.status === 404) {
      return res.status(404).json({
        error: err.message,
      });
    }

    // Handle 403 Forbidden (not the owner)
    if (err.status === 403) {
      return res.status(403).json({
        error: err.message,
      });
    }

    console.error("Error updating note:", err.message);
    return res.status(500).json({
      error: "Failed to update note",
    });
  }
}

// Export the handlers
module.exports = {
  createNoteHandler,
  listNotesHandler,
  updateNoteHandler,
};

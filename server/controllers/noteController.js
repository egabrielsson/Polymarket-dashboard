// Note Controller
// Handles HTTP requests for Note endpoints
// Validates user input, calls service layer, and returns appropriate HTTP responses

const { createNote } = require("../services/noteService");

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

// Export the handlers
module.exports = {
  createNoteHandler,
};

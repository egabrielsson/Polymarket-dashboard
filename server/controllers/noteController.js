// Note Controller
// Handles HTTP requests for Note endpoints
// Validates user input, calls service layer, and returns appropriate HTTP responses

const {
  createNote,
  listNotesByMarket,
  updateNote,
  deleteNote,
  getNoteForUserMarket,
  upsertNoteForUserMarket,
  deleteNoteForUserMarket,
} = require('../services/noteService')

function mapErrorToStatus(err) {
  if (!err || !err.code) return 500
  if (err.code === 'BAD_REQUEST') return 400
  if (err.code === 'NOT_FOUND') return 404
  if (err.code === 'NOT_IN_WATCHLIST') return 404
  if (err.code === 'FORBIDDEN') return 403
  return 500
}

function mapErrorMessage(err, fallback) {
  return err?.message || fallback
}

// Create or update a note for a specific market (legacy endpoint)
async function createNoteHandler(req, res) {
  try {
    const { userId, content } = req.body
    const { marketId } = req.params

    if (!marketId) {
      return res.status(400).json({ error: 'marketId is required' })
    }

    const note = await createNote(userId, marketId, content)

    return res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: note,
    })
  } catch (err) {
    const status = mapErrorToStatus(err)
    console.error('Error creating note:', err.message)
    return res.status(status).json({ error: mapErrorMessage(err, 'Failed to create note') })
  }
}

// List notes for a market, optionally filtered by userId
async function listNotesHandler(req, res) {
  try {
    const { marketId } = req.params
    const { userId } = req.query

    if (!marketId) {
      return res.status(400).json({ error: 'marketId is required' })
    }

    const notes = await listNotesByMarket(marketId, userId)

    return res.status(200).json({
      success: true,
      data: notes,
    })
  } catch (err) {
    const status = mapErrorToStatus(err)
    console.error('Error listing notes:', err.message)
    return res.status(status).json({ error: mapErrorMessage(err, 'Failed to list notes') })
  }
}

// Update a note's content by note id (legacy)
async function updateNoteHandler(req, res) {
  try {
    const { id } = req.params
    const { userId, content } = req.body

    const note = await updateNote(id, userId, content)

    return res.status(200).json({
      success: true,
      data: note,
    })
  } catch (err) {
    const status = mapErrorToStatus(err)
    console.error('Error updating note:', err.message)
    return res.status(status).json({ error: mapErrorMessage(err, 'Failed to update note') })
  }
}

// Delete a note by note id (legacy)
async function deleteNoteHandler(req, res) {
  try {
    const { id } = req.params
    const { userId } = req.body

    await deleteNote(id, userId)

    return res.status(204).send()
  } catch (err) {
    const status = mapErrorToStatus(err)
    console.error('Error deleting note:', err.message)
    return res.status(status).json({ error: mapErrorMessage(err, 'Failed to delete note') })
  }
}

// Get a user's note for a watchlisted market
async function getUserNoteForMarketHandler(req, res) {
  try {
    const { userId, marketId } = req.params
    const note = await getNoteForUserMarket(userId, marketId)

    return res.status(200).json({ success: true, data: { note } })
  } catch (err) {
    const status = mapErrorToStatus(err)
    console.error('Error fetching note:', err.message)
    return res.status(status).json({ error: mapErrorMessage(err, 'Failed to fetch note') })
  }
}

// Upsert a user's note for a watchlisted market
async function upsertUserNoteForMarketHandler(req, res) {
  try {
    const { userId, marketId } = req.params
    const { content } = req.body

    const note = await upsertNoteForUserMarket(userId, marketId, content)

    return res.status(200).json({ success: true, data: { note } })
  } catch (err) {
    const status = mapErrorToStatus(err)
    console.error('Error saving note:', err.message)
    return res.status(status).json({ error: mapErrorMessage(err, 'Failed to save note') })
  }
}

// Delete a user's note for a watchlisted market
async function deleteUserNoteForMarketHandler(req, res) {
  try {
    const { userId, marketId } = req.params
    await deleteNoteForUserMarket(userId, marketId)
    return res.status(204).send()
  } catch (err) {
    const status = mapErrorToStatus(err)
    console.error('Error deleting user note:', err.message)
    return res.status(status).json({ error: mapErrorMessage(err, 'Failed to delete note') })
  }
}

module.exports = {
  createNoteHandler,
  listNotesHandler,
  updateNoteHandler,
  deleteNoteHandler,
  getUserNoteForMarketHandler,
  upsertUserNoteForMarketHandler,
  deleteUserNoteForMarketHandler,
}

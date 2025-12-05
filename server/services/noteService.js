const mongoose = require('mongoose')
const Note = require('../models/Note')
const User = require('../models/User')
const Market = require('../models/Market')
const Watchlist = require('../models/Watchlist')

async function resolveUser(externalUserId) {
  if (
    !externalUserId ||
    typeof externalUserId !== 'string' ||
    externalUserId.length !== 16
  ) {
    const err = new Error('Invalid userId')
    err.code = 'BAD_REQUEST'
    throw err
  }

  const user = await User.findOne({ characterString: externalUserId }).exec()

  if (!user) {
    const err = new Error('User not found')
    err.code = 'NOT_FOUND'
    throw err
  }

  return user
}

async function resolveMarket(marketId) {
  if (!mongoose.Types.ObjectId.isValid(marketId)) {
    const err = new Error('Invalid marketId')
    err.code = 'BAD_REQUEST'
    throw err
  }

  const market = await Market.findById(marketId).exec()
  if (!market) {
    const err = new Error('Market not found')
    err.code = 'NOT_FOUND'
    throw err
  }

  return market
}

async function ensureWatchlistEntry(userMongoId, marketId) {
  const entry = await Watchlist.findOne({ userId: userMongoId, marketId })
    .lean()
    .exec()

  if (!entry) {
    const err = new Error('Market is not in user watchlist')
    err.code = 'NOT_IN_WATCHLIST'
    throw err
  }

  return entry
}

function sanitizeContent(content) {
  const trimmed = typeof content === 'string' ? content.trim() : ''

  if (!trimmed) {
    const err = new Error('content is required')
    err.code = 'BAD_REQUEST'
    throw err
  }

  if (trimmed.length > 100) {
    const err = new Error('content must be at most 100 characters')
    err.code = 'BAD_REQUEST'
    throw err
  }

  return trimmed
}

async function upsertNoteForUserMarket(externalUserId, marketId, content) {
  const sanitizedContent = sanitizeContent(content)
  const user = await resolveUser(externalUserId)
  await resolveMarket(marketId)
  await ensureWatchlistEntry(user._id, marketId)

  const note = await Note.findOneAndUpdate(
    { userId: user._id, marketId },
    { $set: { content: sanitizedContent } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).exec()

  return note
}

async function getNoteForUserMarket(externalUserId, marketId) {
  const user = await resolveUser(externalUserId)
  await resolveMarket(marketId)
  await ensureWatchlistEntry(user._id, marketId)

  const note = await Note.findOne({ userId: user._id, marketId }).exec()
  return note
}

async function deleteNoteForUserMarket(externalUserId, marketId) {
  const user = await resolveUser(externalUserId)
  await resolveMarket(marketId)
  await ensureWatchlistEntry(user._id, marketId)

  const deleted = await Note.findOneAndDelete({
    userId: user._id,
    marketId,
  }).exec()

  if (!deleted) {
    const err = new Error('Note not found')
    err.code = 'NOT_FOUND'
    throw err
  }
}

async function listNotesByMarket(marketId, externalUserId) {
  await resolveMarket(marketId)

  if (externalUserId) {
    const user = await resolveUser(externalUserId)
    await ensureWatchlistEntry(user._id, marketId)
    return Note.find({ userId: user._id, marketId }).sort('-createdAt').exec()
  }

  return Note.find({ marketId }).sort('-createdAt').exec()
}

async function createNote(userId, marketId, content) {
  return upsertNoteForUserMarket(userId, marketId, content)
}

async function updateNote(noteId, userId, content) {
  const sanitizedContent = sanitizeContent(content)
  const user = await resolveUser(userId)

  const note = await Note.findById(noteId).exec()

  if (!note) {
    const err = new Error('Note not found')
    err.code = 'NOT_FOUND'
    throw err
  }

  if (note.userId.toString() !== user._id.toString()) {
    const err = new Error('Only the note owner can update this note')
    err.code = 'FORBIDDEN'
    throw err
  }

  note.content = sanitizedContent
  return note.save()
}

async function deleteNote(noteId, userId) {
  const user = await resolveUser(userId)
  const note = await Note.findById(noteId).exec()

  if (!note) {
    const err = new Error('Note not found')
    err.code = 'NOT_FOUND'
    throw err
  }

  if (note.userId.toString() !== user._id.toString()) {
    const err = new Error('Only the note owner can delete this note')
    err.code = 'FORBIDDEN'
    throw err
  }

  await Note.findByIdAndDelete(noteId).exec()
}

module.exports = {
  createNote,
  listNotesByMarket,
  updateNote,
  deleteNote,
  getNoteForUserMarket,
  upsertNoteForUserMarket,
  deleteNoteForUserMarket,
}

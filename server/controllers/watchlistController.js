// Controller for Watchlist-related endpoints.
// Handles HTTP layer and maps service error codes -> HTTP status codes.

const watchlistService = require('../services/watchlistService');

/**
 * POST /api/users/:userId/watchlist
 * Adds a market to the user's watchlist.
 */


async function addToWatchlist(req, res, next) {
  try {
    // Extracs the route param and body 
    const { userId } = req.params;
    const { marketId } = req.body;

    // Request validation.
    if (!marketId) {
      return res.status(400).json({ error: 'marketId is required' });
    }

    // Delegates to the service which returns the array of populated market documents
    const watchlist = await watchlistService.addToWatchlist(userId, marketId);

    // Success: return 201 with unified response shape
    return res.status(201).json({ success: true, data: { watchlist } });
  } catch (err) {
    // Map known service error codes to statuses
    if (err && err.code === 'BAD_REQUEST') { return res.status(400).json({ error: err.message });}
    if (err && err.code === 'NOT_FOUND') { return res.status(404).json({ error: err.message });}
    if (err && err.code === 'DUPLICATE') { return res.status(409).json({ error: err.message });}

    // For anything unexpected it logs the error for debugging and returns 502
    console.error('Error adding to watchlist:', err);
    return res.status(502).json({ error: 'Failed to add market to watchlist' });
  }
}

module.exports = { addToWatchlist};
// Controller for Watchlist-related endpoints.
const watchlistService = require('../services/watchlistService');

/**
 * GET /api/users/:userId/watchlists
 * Get handler that returns a user's watchlist as an array of markets
 */
async function getUserWatchlist(req, res, next){
  try {
    // route param
    const { userId } = req.params;

    // Delegate to service which returs populated market documents
    const watchlist = await watchlistService.getUserWatchlist(userId);

    // If success return 200 with unified response shape
    return res.status(200).json({ success: true, data: { watchlist } });
  } catch (err) {
    // Map known service error codes to HTTP statuses
    if (err && err.code === 'BAD_REQUEST') { return res.status(400).json({ error: err.message });}
    if (err && err.code === 'NOT_FOUND') { return res.status(404).json({ error: err.message });}

    // Unexpected errors logs and returns 502
    console.error('Error getting watchlist:', err);
    return res.status(502).json({ error: 'Failed to get user watchlist' });
  }
}

/**
 * GET /api/users/:userId/watchlists/:marketId
 * Returns a single watchlist entry populated with market data.
 */
async function getWatchlistItem(req, res, next) {
  try {
    const { userId, marketId } = req.params;
    const market = await watchlistService.getWatchlistEntry(userId, marketId);
    return res.status(200).json({ success: true, data: { market } });
  } catch (err) {
    if (err && err.code === 'BAD_REQUEST') {
      return res.status(400).json({ error: err.message });
    }
    if (err && err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: err.message });
    }
    console.error('Error getting watchlist item:', err);
    return res.status(502).json({ error: 'Failed to get watchlist item' });
  }
}


/**
 * DELETE /api/users/:userId/watchlists/:marketId
 * Calls service to remove relation and returns 204 on success.
 */
async function removeFromWatchlist(req, res, next) {
  try {
    // Route param
    const { userId, marketId } = req.params;
    
    // Delegates to service which returns nothing if succeded
    await watchlistService.removeFromWatchlist(userId, marketId);

    // Success if no content 
    return res.status(204).send(); // Returns 204 if succeded
  } catch (err) {

    // Known service error mappings
    if (err && err.code === 'BAD_REQUEST') { return res.status(400).json({ error: err.message });}
    if (err && err.code === 'NOT_FOUND') { return res.status(404).json({ error: err.message });}

    // Unexpected error logs and returns 502
    console.error('Error removing from watchlist:', err);
    return res.status(502).json({ error: 'Failed to remove market from watchlist' });
  }
}






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

module.exports = {
  addToWatchlist,
  getUserWatchlist,
  getWatchlistItem,
  removeFromWatchlist,
};
// Controller for Watchlists-related endpoints.
const watchlistsService = require('../services/watchlistsService');

/**
 * GET /api/users/:userId/watchlists
 * Get handler that returns a user's watchlists as an array of markets
 */
async function getUserWatchlists(req, res, next){
  try {
    // route param
    const { userId } = req.params;

    // Delegate to service which returs populated market documents
    const watchlists = await watchlistsService.getUserWatchlists(userId);

    // If success return 200 with unified response shape
    return res.status(200).json({ success: true, data: { watchlists } });
  } catch (err) {
    // Map known service error codes to HTTP statuses
    if (err && err.code === 'BAD_REQUEST') { return res.status(400).json({ error: err.message });}
    if (err && err.code === 'NOT_FOUND') { return res.status(404).json({ error: err.message });}

    // Unexpected errors logs and returns 502
    console.error('Error getting watchlists:', err);
    return res.status(502).json({ error: 'Failed to get user watchlists' });
  }
}


/**
 * DELETE /api/users/:userId/watchlists/:marketId
 * Calls service to remove relation and returns 204 on success.
 */
async function removeFromWatchlists(req, res, next) {
  try {
    // Route param
    const { userId, marketId } = req.params;
    
    // Delegates to service which returns nothing if succeded
    await watchlistsService.removeFromWatchlists(userId, marketId);

    // Success if no content 
    return res.status(204).send(); // Returns 204 if succeded
  } catch (err) {

    // Known service error mappings
    if (err && err.code === 'BAD_REQUEST') { return res.status(400).json({ error: err.message });}
    if (err && err.code === 'NOT_FOUND') { return res.status(404).json({ error: err.message });}

    // Unexpected error logs and returns 502
    console.error('Error removing from watchlists:', err);
    return res.status(502).json({ error: 'Failed to remove market from watchlists' });
  }
}






/**
 * POST /api/users/:userId/watchlists
 * Adds a market to the user's watchlists.
 */

async function addToWatchlists(req, res, next) {
  try {
    // Extracs the route param and body 
    const { userId } = req.params;
    const { marketId } = req.body;

    // Request validation.
    if (!marketId) {
      return res.status(400).json({ error: 'marketId is required' });
    }

    // Delegates to the service which returns the array of populated market documents
    const watchlists = await watchlistsService.addToWatchlists(userId, marketId);

    // Success: return 201 with unified response shape
    return res.status(201).json({ success: true, data: { watchlists } });
  } catch (err) {
    // Map known service error codes to statuses
    if (err && err.code === 'BAD_REQUEST') { return res.status(400).json({ error: err.message });}
    if (err && err.code === 'NOT_FOUND') { return res.status(404).json({ error: err.message });}
    if (err && err.code === 'DUPLICATE') { return res.status(409).json({ error: err.message });}

    // For anything unexpected it logs the error for debugging and returns 502
    console.error('Error adding to watchlists:', err);
    return res.status(502).json({ error: 'Failed to add market to watchlists' });
  }
}

module.exports = { addToWatchlists, getUserWatchlists, removeFromWatchlists};
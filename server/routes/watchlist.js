// Routes for Watchlist endpoints used to allow users 
// to add markets in their personal watchlist
const express = require('express'); // loads the express package
const router = express.Router();

// 
const { addToWatchlist, getUserWatchlist, removeFromWatchlist } = require('../controllers/watchlistController'); 

// POST /api/users/:userId/watchlist
// and adds a market to the user's watchlist.
// Returns with 201 with updated watchlist on success.
// Returns 409 if the market is already in the watchlist.
router.post('/users/:userId/watchlists', addToWatchlist);

// GET /api/users/:userId/watchlists
// Returns array of populated markets
// If success 200, if not 502 for failure getting
router.get('/users/:userId/watchlists', getUserWatchlist);

// DELETE /api/users/:userId/watchlists/:marketId
// Returns 204 if succeded
// Returns 502 if failed
router.delete('/users/:userId/watchlists/:marketId', removeFromWatchlist);

// exports the router to be used later.
module.exports = router;
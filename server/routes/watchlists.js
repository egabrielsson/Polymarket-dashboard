// Routes for Watchlists endpoints used to allow users 
// to add markets in their personal watchlists
const express = require('express'); // loads the express package
const router = express.Router();

// 
const { addToWatchlists, getUserWatchlists, removeFromWatchlists } = require('../controllers/watchlistsController'); 

// POST /api/users/:userId/watchlists
// and adds a market to the user's watchlists.
// Returns with 201 with updated watchlists on success.
// Returns 409 if the market is already in the watchlists.
router.post('/users/:userId/watchlists', addToWatchlists);

// GET /api/users/:userId/watchlists
// Returns array of populated markets
// If success 200, if not 502 for failure getting
router.get('/users/:userId/watchlists', getUserWatchlists);

// DELETE /api/users/:userId/watchlists/:marketId
// Returns 204 if succeded
// Returns 502 if failed
router.delete('/users/:userId/watchlists/:marketId', removeFromWatchlists);

// exports the router to be used later.
module.exports = router;
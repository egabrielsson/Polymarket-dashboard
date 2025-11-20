// Routes for Watchlist endpoints used to allow users 
// to add markets in their personal watchlist
const express = require('express'); // loads the express package
const router = express.Router();

// 
const { addToWatchlist } = require('../controllers/watchlistController'); 

// POST /api/users/:userId/watchlist
// and adds a market to the user's watchlist.
// Returns with 201 with updated watchlist on success.
// Returns 409 if the market is already in the watchlist.
router.post('/users/:userId/watchlist', addToWatchlist);

// exports the router to be used later.
module.exports = router;
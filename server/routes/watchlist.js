// Routes for Watchlist endpoints used to allow users
// to add markets in their personal watchlist
const express = require("express") // loads the express package
const router = express.Router()

//
const {
  addToWatchlist,
  getUserWatchlist,
  getWatchlistItem,
  removeFromWatchlist,
  updateWatchlistCategory,
} = require("../controllers/watchlistController")
const {
  getUserNoteForMarketHandler,
  upsertUserNoteForMarketHandler,
  deleteUserNoteForMarketHandler,
} = require("../controllers/noteController")

// POST /api/users/:userId/watchlists
// and adds a market to the user's watchlist.
// Returns with 201 with updated watchlist on success.
// Returns 409 if the market is already in the watchlist.
router.post("/users/:userId/watchlists", addToWatchlist)

// GET /api/users/:userId/watchlists
// Returns array of populated markets
// If success 200, if not 502 for failure getting
router.get("/users/:userId/watchlists", getUserWatchlist)

// GET /api/users/:userId/watchlists/:marketId
// Returns single watchlist entry populated with market
router.get("/users/:userId/watchlists/:marketId", getWatchlistItem)

// DELETE /api/users/:userId/watchlists/:marketId
// Returns 204 if succeded
// Returns 502 if failed
router.delete("/users/:userId/watchlists/:marketId", removeFromWatchlist)

// PATCH /api/users/:userId/watchlists/:marketId/category
// Update the category for a market in user's watchlist
router.patch("/users/:userId/watchlists/:marketId/category", updateWatchlistCategory)

// NOTE ROUTES - User-specific note attached to a watchlisted market
router.get(
  "/users/:userId/watchlists/:marketId/note",
  getUserNoteForMarketHandler
)
router.put(
  "/users/:userId/watchlists/:marketId/note",
  upsertUserNoteForMarketHandler
)
router.delete(
  "/users/:userId/watchlists/:marketId/note",
  deleteUserNoteForMarketHandler
)

// exports the router to be used later.
module.exports = router

// routes/users.js
// User-related API endpoints: registration, login, update username, deletion.

const express = require("express");
const {
  createUserHandler,
  loginHandler,
  updateUsernameHandler,
  deleteUserHandler,
  getAllUsersHandler,
  deleteAllUsersHandler,
} = require("../controllers/userController");

const router = express.Router();

/**
 * GET /api/users
 * Get all users
 */
router.get("/users", getAllUsersHandler);

/**
 * POST /api/users
 * Body: { "username": "MyFirstUser" }
 */
router.post("/users", createUserHandler);

/**
 * POST /api/sessions
 * Body: { "id": "A1B2C3D4E5F6G7H8" }  // 16-character id
 */
router.post("/sessions", loginHandler);

/**
 * PATCH /api/users/:id
 * Body: { "newUsername": "NewName" }
 */
router.patch("/users/:id", updateUsernameHandler);

/**
 * DELETE /api/users
 */
router.delete("/users", deleteAllUsersHandler);

/**
 * DELETE /api/users/:id
 */
router.delete("/users/:id", deleteUserHandler);

module.exports = router;

// routes/users.js
// User-related API endpoints: registration, login, update username, deletion.

const express = require("express");
const {
  createUserHandler,
  loginHandler,
  updateUsernameHandler,
  deleteUserHandler,
} = require("../controllers/userController");

const router = express.Router();

/**
 * POST /api/users
 * Body: { "username": "MyFirstUser" }
 */
router.post("/users", createUserHandler);

/**
 * POST /api/sessions
 * Body: { "characterString": "A1B2C3D4E5F6G7H8" }
 */
router.post("/sessions", loginHandler);

/**
 * PATCH /api/users/:characterString
 * Body: { "newUsername": "NewName" }
 */
router.patch("/users/:characterString", updateUsernameHandler);

/**
 * DELETE /api/users/:characterString
 */
router.delete("/users/:characterString", deleteUserHandler);

module.exports = router;

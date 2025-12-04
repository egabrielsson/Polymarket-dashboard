// controllers/userController.js
// Handles HTTP-level concerns: req/res, status codes, JSON shape.
// Uses userService for the actual logic.

const {
  createUser,
  loginByCharacterString,
  updateUsername,
  deleteUserByCharacterString,
  getAllUsers,
} = require("../services/userService");

// POST /api/users
async function createUserHandler(req, res) {
  try {
    const { username } = req.body;
    const user = await createUser(username);

    return res.status(201).json({
      message: "User created",
      user: {
        id: user.characterString,
        characterString: user.characterString, 
        username: user.username,
      },
    });
  } catch (err) {
    if (err && err.code === "BAD_REQUEST") {
      return res.status(401).json({ error: err.message });
    }
    if (err && err.code === "DUPLICATE") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error creating user:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// POST /api/sessions
async function loginHandler(req, res) {
  try {
    const { id } = req.body; // previously: characterString
    const user = await loginByCharacterString(id);

    return res.status(200).json({
      message: "Login successful",
      userId: user.characterString, // still the same underlying field
      username: user.username,
    });
  } catch (err) {
    if (err && err.code === "BAD_REQUEST") {
      return res.status(401).json({ error: err.message });
    }
    if (err && err.code === "NOT_FOUND") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error logging in user:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// PATCH /api/users/:id
async function updateUsernameHandler(req, res) {
  try {
    const { id } = req.params; // previously: characterString
    const { newUsername } = req.body;

    const updatedUser = await updateUsername(id, newUsername);

    return res.status(200).json({
      message: "Username updated successfully",
      userId: updatedUser.characterString,
      username: updatedUser.username,
    });
  } catch (err) {
    if (err && err.code === "BAD_REQUEST") {
      return res.status(401).json({ error: err.message });
    }
    if (err && err.code === "NOT_FOUND") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error updating username:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// DELETE /api/users/:id
async function deleteUserHandler(req, res) {
  try {
    const { id } = req.params; // previously: characterString

    const deletedUser = await deleteUserByCharacterString(id);

    return res.status(200).json({
      message: "Deletion successful",
      userId: deletedUser.characterString,
      username: deletedUser.username,
    });
  } catch (err) {
    if (err && err.code === "BAD_REQUEST") {
      return res.status(401).json({ error: err.message });
    }
    if (err && err.code === "NOT_FOUND") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error deleting user:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// GET /api/users
async function getAllUsersHandler(req, res) {
  try {
    const users = await getAllUsers();

    // Map internal `characterString` to external `id`
    const serializedUsers = users.map((user) => ({
      id: user.characterString,
      username: user.username,
    }));

    return res.status(200).json({
      success: true,
      data: { users: serializedUsers },
    });
  } catch (err) {
    console.error("Error getting all users:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  createUserHandler,
  loginHandler,
  updateUsernameHandler,
  deleteUserHandler,
  getAllUsersHandler,
};

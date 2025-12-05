// controllers/userController.js
// Handles HTTP-level concerns: req/res, status codes, JSON shape.
// Uses userService for the actual logic.

const {
  createUser,
  loginById,
  getUserById,
  updateUsername,
  deleteUserById,
  getAllUsers,
  deleteAllUsers,
} = require("../services/userService");

// POST /api/users
async function createUserHandler(req, res) {
  try {
    const { username } = req.body;
    const user = await createUser(username);

    return res.status(201).json({
      message: "User created",
      user: {
        id: user.characterString, // user id (stored in characterString field) exposed as `id`
        username: user.username,
      },
    });
  } catch (err) {
    if (err && err.code === "BAD_REQUEST") {
      return res.status(400).json({ error: err.message });
    }
    if (err && err.code === "DUPLICATE") {
      return res.status(409).json({ error: err.message });
    }
    console.error("Error creating user:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// POST /api/sessions
async function loginHandler(req, res) {
  try {
    const { id } = req.body; // 16-character user id
    const user = await loginById(id);

    return res.status(200).json({
      message: "Login successful",
      userId: user.characterString, // user id (stored in characterString field)
      username: user.username,
    });
  } catch (err) {
    if (err && err.code === "BAD_REQUEST") {
      return res.status(400).json({ error: err.message });
    }
    if (err && err.code === "NOT_FOUND") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error logging in user:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// GET /api/users/:id
async function getUserHandler(req, res) {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    return res.status(200).json({
      success: true,
      data: {
        id: user.characterString,
        username: user.username,
      },
    });
  } catch (err) {
    if (err && err.code === "BAD_REQUEST") {
      return res.status(400).json({ error: err.message });
    }
    if (err && err.code === "NOT_FOUND") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error getting user:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// PATCH /api/users/:id
async function updateUsernameHandler(req, res) {
  try {
    const { id } = req.params; // 16-character user id
    const { newUsername } = req.body;

    const updatedUser = await updateUsername(id, newUsername);

    return res.status(200).json({
      message: "Username updated successfully",
      userId: updatedUser.characterString, // user id (stored in characterString field)
      username: updatedUser.username,
    });
  } catch (err) {
    if (err && err.code === "BAD_REQUEST") {
      return res.status(400).json({ error: err.message });
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
    const { id } = req.params; // 16-character user id

    const deletedUser = await deleteUserById(id);

    return res.status(200).json({
      message: "Deletion successful",
      userId: deletedUser.characterString, // user id (stored in characterString field)
      username: deletedUser.username,
    });
  } catch (err) {
    if (err && err.code === "BAD_REQUEST") {
      return res.status(400).json({ error: err.message });
    }
    if (err && err.code === "NOT_FOUND") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error deleting user:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

// DELETE /api/users
async function deleteAllUsersHandler(req, res) {
  try {
    await deleteAllUsers();
    return res.status(204).send();
  } catch (err) {
    console.error("Error deleting all users:", err);
    return res.status(500).json({ error: "Failed to delete users" });
  }
}

// GET /api/users
async function getAllUsersHandler(req, res) {
  try {
    const users = await getAllUsers();

    // Map user id (stored in characterString field) to external `id`
    const serializedUsers = users.map((user) => ({
      id: user.characterString, // user id exposed as `id`
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
  getUserHandler,
  updateUsernameHandler,
  deleteUserHandler,
  getAllUsersHandler,
  deleteAllUsersHandler,
};

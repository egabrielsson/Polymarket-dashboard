// controllers/userController.js
// Handles HTTP-level concerns: req/res, status codes, JSON shape.
// Uses userService for the actual logic.

const {
  createUser,
  loginByCharacterString,
  updateUsername,
  deleteUserByCharacterString,
} = require("../services/userService");

// POST /api/users
async function createUserHandler(req, res) {
  try {
    const { username } = req.body;
    const user = await createUser(username);

    return res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        username: user.username,
        characterString: user.characterString,
      },
    });
  } catch (err) {
    if (err.message === "USERNAME_REQUIRED") {
      return res.status(400).json({ message: "Username is required" });
    }
    if (err.message === "DUPLICATE_CHARACTER_STRING") {
      return res
        .status(409)
        .json({ message: "Generated ID already exists, please try again" });
    }
    console.error("Error creating user:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/sessions
async function loginHandler(req, res) {
  try {
    const { characterString } = req.body;
    const user = await loginByCharacterString(characterString);

    return res.status(200).json({
      message: "Login successful",
      userId: user._id,
      characterString: user.characterString,
      username: user.username,
    });
  } catch (err) {
    if (err.message === "CHARACTER_STRING_REQUIRED") {
      return res
        .status(400)
        .json({ message: "16 character string is required" });
    }
    if (err.message === "USER_NOT_FOUND") {
      return res
        .status(404)
        .json({ message: "User with this character string does not exist" });
    }
    console.error("Error logging in user:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// PATCH /api/users/:characterString
async function updateUsernameHandler(req, res) {
  try {
    const { characterString } = req.params;
    const { newUsername } = req.body;

    const updatedUser = await updateUsername(characterString, newUsername);

    return res.status(200).json({
      message: "Username updated successfully",
      userId: updatedUser._id,
      characterString: updatedUser.characterString,
      username: updatedUser.username,
    });
  } catch (err) {
    if (err.message === "CHARACTER_STRING_REQUIRED") {
      return res
        .status(400)
        .json({ message: "16 character string is required" });
    }
    if (err.message === "NEW_USERNAME_REQUIRED") {
      return res.status(400).json({ message: "newUsername is required" });
    }
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    console.error("Error updating username:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// DELETE /api/users/:characterString
async function deleteUserHandler(req, res) {
  try {
    const { characterString } = req.params;

    const deletedUser = await deleteUserByCharacterString(characterString);

    return res.status(200).json({
      message: "Deletion successful",
      userId: deletedUser._id,
      characterString: deletedUser.characterString,
      username: deletedUser.username,
    });
  } catch (err) {
    if (err.message === "CHARACTER_STRING_REQUIRED") {
      return res
        .status(400)
        .json({ message: "16 character string is required" });
    }
    if (err.message === "USER_NOT_FOUND") {
      return res
        .status(404)
        .json({ message: "User with this character string does not exist" });
    }
    console.error("Error deleting user:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createUserHandler,
  loginHandler,
  updateUsernameHandler,
  deleteUserHandler,
};

// services/userService.js
const User = require("../models/User");
const generateId = require("../IDcreation");

/**
 * Create a new user with a generated 16-character id.
 * The id is stored in the `characterString` field on the User model.
 */
async function createUser(username) {
  if (!username) {
    const err = new Error("Username is required");
    err.code = "BAD_REQUEST";
    throw err;
  }

  try {
    const id = generateId(); // 16-char id

    const user = await User.create({
      characterString: id, // stored in characterString
      username,
    });

    return user;
  } catch (err) {
    // Duplicate key error from MongoDB
    if (err.code === 11000) {
      const dupErr = new Error("Generated id already exists, please try again");
      dupErr.code = "DUPLICATE";
      throw dupErr;
    }
    throw err;
  }
}

/**
 * "Login" by 16-character id
 * (function name kept for compatibility)
 */
async function loginByCharacterString(id) {
  if (!id) {
    const err = new Error("16 character id is required");
    err.code = "BAD_REQUEST";
    throw err;
  }

  const user = await User.findOne({ characterString: id });

  if (!user) {
    const err = new Error("User with this id does not exist");
    err.code = "NOT_FOUND";
    throw err;
  }

  return user;
}

/**
 * Update username for a given id.
 * The id is stored in `characterString`.
 */
async function updateUsername(id, newUsername) {
  if (!id) {
    const err = new Error("16 character id is required");
    err.code = "BAD_REQUEST";
    throw err;
  }

  if (!newUsername) {
    const err = new Error("newUsername is required");
    err.code = "BAD_REQUEST";
    throw err;
  }

  const updatedUser = await User.findOneAndUpdate(
    { characterString: id },
    { $set: { username: newUsername } },
    { new: true }
  );

  if (!updatedUser) {
    const err = new Error("User not found");
    err.code = "NOT_FOUND";
    throw err;
  }

  return updatedUser;
}

/**
 * Delete user by id.
 * (function name kept for compatibility)
 */
async function deleteUserByCharacterString(id) {
  if (!id) {
    const err = new Error("16 character id is required");
    err.code = "BAD_REQUEST";
    throw err;
  }

  const deletedUser = await User.findOneAndDelete({ characterString: id });

  if (!deletedUser) {
    const err = new Error("User with this id does not exist");
    err.code = "NOT_FOUND";
    throw err;
  }

  return deletedUser;
}

/**
 * Get all users.
 * Returns _id, username, and characterString (the stored id).
 */
async function getAllUsers() {
  const users = await User.find({}).select("_id username characterString");
  return users;
}

module.exports = {
  createUser,
  loginByCharacterString,
  updateUsername,
  deleteUserByCharacterString,
  getAllUsers,
};

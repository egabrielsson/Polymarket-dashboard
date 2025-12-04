// services/userService.js
const User = require("../models/User");
const generateId = require("../utils/IDcreation");

/**
 * Create a new user with a generated 16-character id.
 * Note: The id is stored in the database field named `characterString` for historical reasons,
 * but conceptually this is the user's unique identifier.
 */
async function createUser(username) {
  if (!username) {
    const err = new Error("Username is required");
    err.code = "BAD_REQUEST";
    throw err;
  }

  try {
    const id = generateId(); // 16-character unique id

    const user = await User.create({
      characterString: id, // Database field name (historical), stores the user id
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
 * Login by 16-character user id
 */
async function loginById(id) {
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
 * Update username for a given user id
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
 * Delete user by id
 */
async function deleteUserById(id) {
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
 * Delete entire users collection
 */
async function deleteAllUsers() {
  await User.deleteMany({});
}

/**
 * Get all users.
 * Returns _id, username, and id (stored in characterString field).
 */
async function getAllUsers() {
  const users = await User.find({}).select("_id username characterString");
  return users;
}

module.exports = {
  createUser,
  loginById,
  updateUsername,
  deleteUserById,
  getAllUsers,
  deleteAllUsers,
};

// services/userService.js
const User = require("../models/User");
const generateId = require("../IDcreation");

/**
 * Create a new user with a generated 16-character characterString
 */
async function createUser(username) {
  if (!username) {
    const err = new Error("Username is required");
    err.code = 'BAD_REQUEST';
    throw err;
  }

  try {
    const characterString = generateId();

    const user = await User.create({
      characterString,
      username,
    });

    return user;
  } catch (err) {
    if (err.code === 11000) {
      const dupErr = new Error("Generated ID already exists, please try again");
      dupErr.code = 'DUPLICATE';
      throw dupErr;
    }
    throw err;
  }
}

/**
 * "Login" by 16-character characterString
 */
async function loginByCharacterString(characterString) {
  if (!characterString) {
    const err = new Error("16 character string is required");
    err.code = 'BAD_REQUEST';
    throw err;
  }

  const user = await User.findOne({ characterString });

  if (!user) {
    const err = new Error("User with this character string does not exist");
    err.code = 'NOT_FOUND';
    throw err;
  }

  return user;
}

/**
 * Update username for a given characterString
 */
async function updateUsername(characterString, newUsername) {
  if (!characterString) {
    const err = new Error("16 character string is required");
    err.code = 'BAD_REQUEST';
    throw err;
  }
  if (!newUsername) {
    const err = new Error("newUsername is required");
    err.code = 'BAD_REQUEST';
    throw err;
  }

  const updatedUser = await User.findOneAndUpdate(
    { characterString },
    { $set: { username: newUsername } },
    { new: true }
  );

  if (!updatedUser) {
    const err = new Error("User not found");
    err.code = 'NOT_FOUND';
    throw err;
  }

  return updatedUser;
}

/**
 * Delete user by characterString
 */
async function deleteUserByCharacterString(characterString) {
  if (!characterString) {
    const err = new Error("16 character string is required");
    err.code = 'BAD_REQUEST';
    throw err;
  }

  const deletedUser = await User.findOneAndDelete({ characterString });

  if (!deletedUser) {
    const err = new Error("User with this character string does not exist");
    err.code = 'NOT_FOUND';
    throw err;
  }

  return deletedUser;
}

/**
 * Get all users
 */
async function getAllUsers() {
  const users = await User.find({}).select('_id username characterString');
  return users;
}

module.exports = {
  createUser,
  loginByCharacterString,
  updateUsername,
  deleteUserByCharacterString,
  getAllUsers,
};

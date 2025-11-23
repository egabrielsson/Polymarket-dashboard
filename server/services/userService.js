// services/userService.js
const User = require("../models/User");
const generateId = require("../IDcreation");

/**
 * Create a new user with a generated 16-character characterString
 */
async function createUser(username) {
  if (!username) {
    const err = new Error("USERNAME_REQUIRED");
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
      const dupErr = new Error("DUPLICATE_CHARACTER_STRING");
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
    const err = new Error("CHARACTER_STRING_REQUIRED");
    throw err;
  }

  const user = await User.findOne({ characterString });

  if (!user) {
    const err = new Error("USER_NOT_FOUND");
    throw err;
  }

  return user;
}

/**
 * Update username for a given characterString
 */
async function updateUsername(characterString, newUsername) {
  if (!characterString) {
    const err = new Error("CHARACTER_STRING_REQUIRED");
    throw err;
  }
  if (!newUsername) {
    const err = new Error("NEW_USERNAME_REQUIRED");
    throw err;
  }

  const updatedUser = await User.findOneAndUpdate(
    { characterString },
    { $set: { username: newUsername } },
    { new: true }
  );

  if (!updatedUser) {
    const err = new Error("USER_NOT_FOUND");
    throw err;
  }

  return updatedUser;
}

/**
 * Delete user by characterString
 */
async function deleteUserByCharacterString(characterString) {
  if (!characterString) {
    const err = new Error("CHARACTER_STRING_REQUIRED");
    throw err;
  }

  const deletedUser = await User.findOneAndDelete({ characterString });

  if (!deletedUser) {
    const err = new Error("USER_NOT_FOUND");
    throw err;
  }

  return deletedUser;
}

module.exports = {
  createUser,
  loginByCharacterString,
  updateUsername,
  deleteUserByCharacterString,
};

// routes/Usernameupdateroute.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * PATCH /api/users/:characterString
 * Updates the username of the user identified by the 16-character characterString.
 *
 * Postman sample:
 *   Method: PATCH
 *   URL:    http://localhost:3000/api/users/A1B2C3D4E5F6G7H8
 *   Headers:
 *     Content-Type: application/json
 *   Body (raw JSON):
 *     {
 *       "newUsername": "NewCoolName"
 *     }
 */
router.patch('/users/:characterString', async (req, res) => {
  try {
    const { characterString } = req.params;
    const { newUsername } = req.body;

    if (!newUsername) {
      return res.status(400).json({ message: 'newUsername is required' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { characterString },
      { $set: { username: newUsername } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Username updated successfully',
      userId: updatedUser._id,
      characterString: updatedUser.characterString,
      username: updatedUser.username
    });
  } catch (err) {
    console.error('Error updating username:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

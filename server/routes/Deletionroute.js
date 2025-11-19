// routes/Deletionroute.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * DELETE /api/users/:characterString
 * Deletes the user identified by the 16-character characterString.
 *
 * Postman sample:
 *   Method: DELETE
 *   URL:    http://localhost:3000/api/users/A1B2C3D4E5F6G7H8
 *   Headers:
 *     Content-Type: application/json
 *   Body: (none)
 */
router.delete('/users/:characterString', async (req, res) => {
  try {
    const { characterString } = req.params;

    if (!characterString) {
      return res.status(400).json({ message: '16 character string is required' });
    }

    const deletedUser = await User.findOneAndDelete({ characterString });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User with this character string does not exist' });
    }

    return res.status(200).json({
      message: 'Deletion successful',
      userId: deletedUser._id,
      characterString: deletedUser.characterString,
      username: deletedUser.username
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

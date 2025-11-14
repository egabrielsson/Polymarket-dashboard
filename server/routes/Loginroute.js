// routes/Loginroute.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * POST /api/sessions
 * "Logs in" a user by verifying their 16-character characterString.
 *
 * Postman sample:
 *   Method: POST
 *   URL:    http://localhost:3000/api/sessions
 *   Headers:
 *     Content-Type: application/json
 *   Body (raw JSON):
 *     {
 *       "characterString": "A1B2C3D4E5F6G7H8"
 *     }
 */
router.post('/sessions', async (req, res) => {
  try {
    const { characterString } = req.body;

    if (!characterString) {
      return res.status(400).json({ message: '16 character string is required' });
    }

    // Find user by their 16-char ID
    const user = await User.findOne({ characterString });

    if (!user) {
      return res.status(404).json({ message: 'User with this character string does not exist' });
    }

    // "Login" successful – you recognized the ID
    return res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      characterString: user.characterString,
      username: user.username
    });
  } catch (err) {
    console.error('Error logging in user:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

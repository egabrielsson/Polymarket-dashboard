// routes/Registrationroute.js
const express = require('express');
const router = express.Router();
const generateId = require('../IDcreation'); // ✅ match actual file name
const User = require('../models/User');

/**
 * POST /api/users
 * Creates a new user with a generated 16-character characterString and a username.
 *
 * Postman sample:
 *   Method: POST
 *   URL:    http://localhost:3000/api/users
 *   Headers:
 *     Content-Type: application/json
 *   Body (raw JSON):
 *     {
 *       "username": "MyFirstUser"
 *     }
 */
router.post('/users', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Generate 16-char id
    const characterString = generateId();

    const user = await User.create({
      characterString,
      username
    });

    return res.status(201).json({
      message: 'User created',
      user: {
        id: user._id,
        username: user.username,
        characterString: user.characterString
      }
    });
  } catch (err) {
    console.error('Error creating user:', err);

    // Duplicate characterString
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Generated ID already exists, please try again' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
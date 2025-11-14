const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

// POST /login
router.post('/login', async (req, res) => {
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
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
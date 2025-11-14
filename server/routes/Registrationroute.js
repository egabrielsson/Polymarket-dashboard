// routes/registration-routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const generateId = require('../generate-Id');
const User = require('../models/User'); 


router.post('/createAccount', async (req, res) => {
  try {
    const {username} = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const userId = generateId();

    const userIdHash = await bcrypt.hash(userId, 10);

    const user = await User.create({
      userIdHash,
      username
    });

    res.status(201).json({
      message: 'User created',
      user: {
        id: user._id,
        username: user.username,
      }
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

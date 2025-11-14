// routes/registration-routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const generateId = require('../generate-Id');
const User = require('../models/User'); // path is from /routes to /models

// POST /api/create-account
router.post('/create-account', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'email, password and username are required' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Optional: use your custom ID generator, or just rely on Mongo _id
    const customId = generateId();

    // Create and save user
    const user = await User.create({
      email,
      passwordHash,
      username
      // you *could* store customId in a field if you add one to the schema
    });

    // Return the created user (without passwordHash)
    res.status(201).json({
      message: 'User created',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        customId // if you want to send it to the frontend
      }
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// (Optional) keep your GET endpoint just to generate an ID
router.get('/create-account', (req, res) => {
  const id = generateId();
  res.json({ message: id });
});

module.exports = router;

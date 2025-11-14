const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

router.patch('/updateUsername', async (req, res) => {
  try {
    const {email, username } = req.body;

    if (!username || !email ) {
      return res.status(400).json({ message: 'new username is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email does not exist' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },                          
      { $set: { username: newUsername }}, 
      { new: true }                       
    );

     if (!updatedUser) {
      return res.status(404).json({ message: 'Email does not exist' });
    }


       return res.status(200).json({
      message: 'Username updated successfully',
      userId: updatedUser._id,
      email: updatedUser.email,
      username: updatedUser.username
    });

  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

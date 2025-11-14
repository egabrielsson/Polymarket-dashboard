const express = require('express');
const router = express.Router();
const User = require('../models/User'); 


router.patch('/updateUsername', async (req, res) => {
  try {
    const { characterString, newUsername } = req.body;

    if (!characterString || !newUsername) {
      return res.status(400).json({ message: 'characterString and newUsername are required' });
    }

    
    const updatedUser = await User.findOneAndUpdate(
      { characterString },                
      { $set: { username: newUsername }}, 
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
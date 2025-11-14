const express = require('express');
const router = express.Router();
const User = require('../models/User'); 

router.delete('/deleteAccount', async (req, res) => {
  try {
    const { characterString } = req.body;

    if (!characterString) {
      return res.status(400).json({ message: '16 character string is required' });
    }

    const deletedUser = await User.findOneAndDelete({ characterString });

    if (!user) {
      return res.status(404).json({ message: 'User with this character string does not exist' });
    }

    return res.status(200).json({
      message: 'Deletion successful',
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
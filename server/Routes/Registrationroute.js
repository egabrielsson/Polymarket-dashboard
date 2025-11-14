const express = require('express');
const router = express.Router();
const generateId = require('../generate-Id'); 

router.get('/create-account', (req, res) => {
  const id = generateId();
   res.json({ message: id });
});

module.exports = router;
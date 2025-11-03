const express = require('express');
const router = express.Router();
const User = require('../models/User');
const itemController = require('../controllers/itemController');

router.get('/items', itemController.getAllItems);
router.get('/users', async (req, res) => {
  try {
  // console.log("LOG: Received request for leaderboard data.");

    // Find users, sort, limit, and select
    const users = await User.find({ highestScore: { $gt: 0 } })
      .sort({ highestScore: -1 }) 
      .limit(50) 
      .select('walletAddress username highestScore ownedNFTs profilePic');

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({ message: 'Server error while fetching leaderboard.' });
  }
});

module.exports = router;

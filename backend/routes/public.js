const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// A public route to get all minted items for the marketplace
router.get('/items', itemController.getAllItems);

module.exports = router;

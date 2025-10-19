const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/items/mint', upload.single('image'), itemController.mintItem);

module.exports = router;

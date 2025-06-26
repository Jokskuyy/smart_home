const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
const AlertController = require('../controllers/AlertController');

router.get('/latest', jwtMiddleware, AlertController.getLatest);
router.get('/history', jwtMiddleware, AlertController.getHistory);

module.exports = router; 
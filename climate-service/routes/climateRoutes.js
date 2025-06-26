const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
const ClimateController = require('../controllers/ClimateController');

router.get('/latest', jwtMiddleware, ClimateController.getLatest);
router.get('/history', jwtMiddleware, ClimateController.getHistory);

module.exports = router; 
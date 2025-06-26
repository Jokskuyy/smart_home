const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
const SecurityController = require('../controllers/SecurityController');

router.get('/latest', jwtMiddleware, SecurityController.getLatest);
router.get('/history', jwtMiddleware, SecurityController.getHistory);

module.exports = router; 
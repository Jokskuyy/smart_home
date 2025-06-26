const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
const SensorController = require('../controllers/SensorController');

router.get('/', jwtMiddleware, SensorController.getAll);
router.get('/latest', jwtMiddleware, SensorController.getLatest);
router.get('/history', jwtMiddleware, SensorController.getHistory);

module.exports = router; 
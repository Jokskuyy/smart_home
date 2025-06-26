const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
const ControlController = require('../controllers/ControlController');

router.get('/latest', jwtMiddleware, ControlController.getLatest);
router.get('/history', jwtMiddleware, ControlController.getHistory);

// New POST endpoints for control
router.post('/lights', jwtMiddleware, ControlController.controlLights);
router.post('/fan', jwtMiddleware, ControlController.controlFan);
router.post('/lock', jwtMiddleware, ControlController.controlLock);

module.exports = router; 
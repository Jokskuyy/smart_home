const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwtMiddleware');
const DeviceController = require('../controllers/DeviceController');

router.get('/', jwtMiddleware, DeviceController.getAll);
router.get('/:id', jwtMiddleware, DeviceController.getById);
router.post('/', jwtMiddleware, DeviceController.create);
router.put('/:id', jwtMiddleware, DeviceController.update);
router.delete('/:id', jwtMiddleware, DeviceController.delete);
router.get('/latest', jwtMiddleware, DeviceController.getLatest);
router.get('/history', jwtMiddleware, DeviceController.getHistory);

module.exports = router; 
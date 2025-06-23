const express = require("express");
const router = express.Router();
const SensorController = require("../controllers/SensorController");

router.get("/latest", SensorController.getLatest.bind(SensorController));
router.get("/history", SensorController.getHistory.bind(SensorController));

module.exports = router;

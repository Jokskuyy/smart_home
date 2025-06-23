const express = require("express");
const router = express.Router();
const ClimateController = require("../controllers/ClimateController");

router.get("/latest", ClimateController.getLatest.bind(ClimateController));
router.get("/history", ClimateController.getHistory.bind(ClimateController));

module.exports = router;

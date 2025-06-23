const express = require("express");
const router = express.Router();
const ControlController = require("../controllers/ControlController");

router.post("/lights", ControlController.controlLights.bind(ControlController));
router.post("/fan", ControlController.controlFan.bind(ControlController));
router.post("/lock", ControlController.controlLock.bind(ControlController));

module.exports = router;

const express = require("express");
const router = express.Router();
const DeviceController = require("../controllers/DeviceController");

router.get("/status", DeviceController.getStatus.bind(DeviceController));

module.exports = router;

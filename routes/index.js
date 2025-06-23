const express = require("express");
const router = express.Router();

const sensorRoutes = require("./sensorRoutes");
const climateRoutes = require("./climateRoutes");
const securityRoutes = require("./securityRoutes");
const deviceRoutes = require("./deviceRoutes");
const alertRoutes = require("./alertRoutes");
const controlRoutes = require("./controlRoutes");
const dashboardRoutes = require("./dashboardRoutes");

router.use("/sensors", sensorRoutes);
router.use("/climate", climateRoutes);
router.use("/security", securityRoutes);
router.use("/devices", deviceRoutes);
router.use("/alerts", alertRoutes);
router.use("/control", controlRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;

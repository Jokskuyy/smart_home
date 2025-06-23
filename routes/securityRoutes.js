const express = require("express");
const router = express.Router();
const SecurityController = require("../controllers/SecurityController");

router.get("/events", SecurityController.getEvents.bind(SecurityController));

module.exports = router;

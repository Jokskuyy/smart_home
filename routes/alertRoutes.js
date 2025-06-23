const express = require("express");
const router = express.Router();
const AlertController = require("../controllers/AlertController");

router.get("/", AlertController.getAlerts.bind(AlertController));
router.get("/latest", AlertController.getLatestAlert.bind(AlertController)); // ✅ Tambah endpoint latest
router.put("/:id/read", AlertController.markAsRead.bind(AlertController));

module.exports = router;

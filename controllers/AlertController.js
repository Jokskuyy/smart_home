// controllers/AlertController.js
const AlertModel = require("../models/AlertModel");

class AlertController {
  async getAlerts(req, res) {
    try {
      const alerts = await AlertModel.findAll({
        order: "timestamp DESC",
        limit: req.query.limit || 10,
      });

      res.json({
        success: true,
        data: alerts,
        count: alerts.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ✅ Method baru untuk mengambil alert terakhir
  async getLatestAlert(req, res) {
    try {
      const latest = await AlertModel.findLatest();

      res.json({
        success: true,
        data: latest || {
          title: "No alerts",
          message: "No recent alerts",
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async markAsRead(req, res) {
    try {
      await AlertModel.markAsRead(req.params.id);

      res.json({
        success: true,
        message: "Alert marked as read",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AlertController();

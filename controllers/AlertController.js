const BaseController = require("./BaseController");
const AlertModel = require("../models/AlertModel");

class AlertController extends BaseController {
  async getAlerts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const unreadOnly = req.query.unread === "true";

      let data;
      if (unreadOnly) {
        const [rows] = await AlertModel.db.execute(
          "SELECT * FROM alerts WHERE is_read = FALSE ORDER BY created_at DESC LIMIT ?",
          [limit]
        );
        data = rows;
      } else {
        data = await AlertModel.findHistory(limit);
      }

      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async markAsRead(req, res) {
    try {
      const id = req.params.id;
      await AlertModel.markAsRead(id);
      this.handleSuccess(res, null, "Alert marked as read");
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new AlertController();

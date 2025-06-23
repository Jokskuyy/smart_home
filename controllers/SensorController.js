const BaseController = require("./BaseController");
const SensorModel = require("../models/SensorModel");

class SensorController extends BaseController {
  async getLatest(req, res) {
    try {
      const data = await SensorModel.findLatest();
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const data = await SensorModel.findHistory(limit);
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new SensorController();

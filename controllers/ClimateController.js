const BaseController = require("./BaseController");
const ClimateModel = require("../models/ClimateModel");

class ClimateController extends BaseController {
  async getLatest(req, res) {
    try {
      const data = await ClimateModel.findLatest();
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const data = await ClimateModel.findHistory(limit);
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new ClimateController();

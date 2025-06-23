const BaseController = require("./BaseController");
const SecurityModel = require("../models/SecurityModel");

class SecurityController extends BaseController {
  async getEvents(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const data = await SecurityModel.findHistory(limit);
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new SecurityController();

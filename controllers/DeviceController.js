const BaseController = require("./BaseController");
const DeviceModel = require("../models/DeviceModel");

class DeviceController extends BaseController {
  async getStatus(req, res) {
    try {
      const data = await DeviceModel.findAll();
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new DeviceController();

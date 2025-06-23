const BaseController = require("./BaseController");
const SensorModel = require("../models/SensorModel");
const ClimateModel = require("../models/ClimateModel");
const DeviceModel = require("../models/DeviceModel");
const AlertModel = require("../models/AlertModel");
const SecurityModel = require("../models/SecurityModel");

class DashboardController extends BaseController {
  async getSummary(req, res) {
    try {
      const [sensors, climate, device, unreadAlertsCount, recentEvents] =
        await Promise.all([
          SensorModel.findLatest(),
          ClimateModel.findLatest(),
          DeviceModel.findLatest(),
          AlertModel.getUnreadCount(),
          SecurityModel.findHistory(5),
        ]);

      this.handleSuccess(res, {
        sensors,
        climate,
        device,
        unreadAlerts: unreadAlertsCount,
        recentEvents,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }
}

module.exports = new DashboardController();

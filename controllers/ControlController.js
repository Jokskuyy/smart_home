const BaseController = require("./BaseController");
const ControlModel = require("../models/ControlModel");
const MQTTService = require("../services/MQTTService");
const mqttConfig = require("../config/mqtt");

class ControlController extends BaseController {
  async controlDevice(req, res, topic, commandType, allowedActions) {
    try {
      const { action } = req.body;
      if (!allowedActions.includes(action)) {
        return this.handleError(res, new Error("Invalid action"), 400);
      }

      const command = { action };
      await MQTTService.publish(topic, command);
      await ControlModel.logCommand(commandType, action);

      this.handleSuccess(res, null, `${commandType} ${action} command sent`);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async controlLights(req, res) {
    return this.controlDevice(
      req,
      res,
      mqttConfig.topics.LIGHTS_CONTROL,
      "lights",
      ["on", "off", "auto"]
    );
  }

  async controlFan(req, res) {
    return this.controlDevice(req, res, mqttConfig.topics.FAN_CONTROL, "fan", [
      "on",
      "off",
      "auto",
    ]);
  }

  async controlLock(req, res) {
    return this.controlDevice(
      req,
      res,
      mqttConfig.topics.LOCK_CONTROL,
      "lock",
      ["lock", "unlock"]
    );
  }
}

module.exports = new ControlController();

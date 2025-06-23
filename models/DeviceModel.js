const BaseModel = require("./BaseModel");
const MQTTService = require("../services/MQTTService");
const mqttConfig = require("../config/mqtt");

class DeviceModel extends BaseModel {
  constructor() {
    super("device_status");
    console.log("📦 DeviceModel initialized");
    this.registerMQTTHandler();
  }

  registerMQTTHandler() {
    console.log("🔧 Registering MQTT handler for smarthome/status");
    MQTTService.registerHandler(
      mqttConfig.topics.STATUS,
      this.handleDeviceStatus.bind(this)
    );
  }

  async handleDeviceStatus(data) {
    try {
      const columns = await this.getTableSchema();
      const dataFields = [
        "device_id",
        "status",
        "ip_address",
        "wifi_rssi",
        "wifi_quality",
        "free_heap",
        "uptime_seconds",
        "firmware_version",
        "time_string",
        "mqtt_connected",
        "sensors_active",
      ];

      const { query, fields } = this.buildUpsertQuery(columns, dataFields);
      const values = fields.map((field) =>
        field === "time_string" ? data.time : data[field]
      );

      await this.db.execute(query, values);
      console.log("✅ Device status saved to database");
    } catch (error) {
      console.error("❌ Error saving device status:", error.message);
    }
  }
}

module.exports = new DeviceModel();

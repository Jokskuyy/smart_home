const BaseModel = require("./BaseModel");
const MQTTService = require("../services/MQTTService");
const mqttConfig = require("../config/mqtt");

class SensorModel extends BaseModel {
  constructor() {
    super("sensor_data");
    this.registerMQTTHandler();
  }

  registerMQTTHandler() {
    MQTTService.registerHandler(
      mqttConfig.topics.SENSORS,
      this.handleSensorData.bind(this)
    );
  }

  async handleSensorData(data) {
    try {
      const columns = await this.getTableSchema();
      const dataFields = [
        "device_id",
        "timestamp",
        "time_string",
        "gas_level",
        "gas_percentage",
        "gas_ppm",
        "digital_gas",
        "fire_alarm_active",
        "lock_status",
        "light_on",
        "fan_on",
        "light_auto_mode",
        "fan_auto_mode",
      ];

      const { query, fields } = this.buildInsertQuery(columns, dataFields);
      const values = fields.map((field) => {
        if (field === "time_string") return data.time;
        return data[field];
      });

      await this.db.execute(query, values);
      console.log("✅ Sensor data saved to database");
    } catch (error) {
      console.error("❌ Error saving sensor data:", error.message);
    }
  }
}

module.exports = new SensorModel();

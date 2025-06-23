const BaseModel = require("./BaseModel");
const MQTTService = require("../services/MQTTService");
const mqttConfig = require("../config/mqtt");

class ClimateModel extends BaseModel {
  constructor() {
    super("climate_data");
    this.registerMQTTHandler();
  }

  registerMQTTHandler() {
    MQTTService.registerHandler(
      mqttConfig.topics.CLIMATE,
      this.handleClimateData.bind(this)
    );
  }

  async handleClimateData(data) {
    try {
      const columns = await this.getTableSchema();
      const dataFields = [
        "device_id",
        "timestamp",
        "time_string",
        "temperature",
        "humidity",
        "heat_index",
      ];

      const { query, fields } = this.buildInsertQuery(columns, dataFields);
      const values = fields.map((field) =>
        field === "time_string" ? data.time : data[field]
      );

      await this.db.execute(query, values);
      console.log("✅ Climate data saved to database");
    } catch (error) {
      console.error("❌ Error saving climate data:", error.message);
    }
  }
}

module.exports = new ClimateModel();

const BaseModel = require("./BaseModel");
const MQTTService = require("../services/MQTTService");
const mqttConfig = require("../config/mqtt");

class SecurityModel extends BaseModel {
  constructor() {
    super("security_events");
    this.registerMQTTHandler();
  }

  registerMQTTHandler() {
    MQTTService.registerHandler(
      mqttConfig.topics.SECURITY,
      this.handleSecurityEvent.bind(this)
    );
  }

  async handleSecurityEvent(data) {
    try {
      const columns = await this.getTableSchema();
      const dataFields = [
        "device_id",
        "event_type",
        "status",
        "location",
        "timestamp",
        "time_string",
      ];

      const { query, fields } = this.buildInsertQuery(columns, dataFields);
      const values = fields.map((field) =>
        field === "time_string" ? data.time : data[field]
      );

      await this.db.execute(query, values);
      console.log("✅ Security event saved to database");
    } catch (error) {
      console.error("❌ Error saving security event:", error.message);
    }
  }
}

module.exports = new SecurityModel();

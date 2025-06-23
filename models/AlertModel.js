const BaseModel = require("./BaseModel");
const MQTTService = require("../services/MQTTService");
const mqttConfig = require("../config/mqtt");

class AlertModel extends BaseModel {
  constructor() {
    super("alerts");
    this.registerMQTTHandler();
  }

  registerMQTTHandler() {
    MQTTService.registerHandler(
      mqttConfig.topics.ALERTS,
      this.handleAlert.bind(this)
    );
  }

  async handleAlert(data) {
    try {
      const columns = await this.getTableSchema();
      const dataFields = [
        "device_id",
        "alert_type",
        "priority",
        "title",
        "message",
        "metadata",
        "timestamp",
        "time_string",
      ];

      const { query, fields } = this.buildInsertQuery(columns, dataFields);
      const values = fields.map((field) => {
        if (field === "time_string") return data.created_at || data.time;
        if (field === "metadata") return JSON.stringify(data.metadata || {});
        return data[field];
      });

      await this.db.execute(query, values);
      console.log("✅ Alert saved to database");
    } catch (error) {
      console.error("❌ Error saving alert:", error.message);
    }
  }

  async markAsRead(id) {
    await this.db.execute("UPDATE alerts SET is_read = TRUE WHERE id = ?", [
      id,
    ]);
  }

  async getUnreadCount() {
    const [rows] = await this.db.execute(
      "SELECT COUNT(*) as count FROM alerts WHERE is_read = FALSE"
    );
    return rows[0].count;
  }
}

module.exports = new AlertModel();

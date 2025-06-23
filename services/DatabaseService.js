const mysql = require("mysql2/promise");
const dbConfig = require("../config/database");

class DatabaseService {
  constructor() {
    this.pool = null;
    this.tableSchemas = {};
  }

  async initialize() {
    try {
      this.pool = mysql.createPool(dbConfig);
      console.log("✅ Database connection pool created");

      const connection = await this.pool.getConnection();
      console.log("✅ Database connection established");
      connection.release();

      await this.createTables();
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      `CREATE TABLE IF NOT EXISTS sensor_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        device_id VARCHAR(100) NOT NULL,
        timestamp BIGINT NOT NULL,
        time_string VARCHAR(10),
        gas_level INT,
        gas_percentage INT,
        gas_ppm FLOAT,
        digital_gas BOOLEAN,
        fire_alarm_active BOOLEAN,
        lock_status VARCHAR(20),
        light_on BOOLEAN,
        fan_on BOOLEAN,
        light_auto_mode BOOLEAN,
        fan_auto_mode BOOLEAN,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_device_timestamp (device_id, timestamp)
      )`,
      // ... (other table definitions remain the same)
    ];

    for (const tableQuery of tables) {
      try {
        await this.pool.execute(tableQuery);
      } catch (error) {
        console.error("❌ Error creating table:", error.message);
      }
    }
    console.log("✅ All database tables created/verified");
  }

  async getTableSchema(tableName) {
    if (this.tableSchemas[tableName]) {
      return this.tableSchemas[tableName];
    }

    try {
      const [rows] = await this.pool.execute(`DESCRIBE ${tableName}`);
      this.tableSchemas[tableName] = rows.map((row) => row.Field);
      return this.tableSchemas[tableName];
    } catch (error) {
      console.error(`Error getting schema for ${tableName}:`, error.message);
      return [];
    }
  }

  getPool() {
    return this.pool;
  }

  isConnected() {
    return this.pool !== null;
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

module.exports = new DatabaseService();

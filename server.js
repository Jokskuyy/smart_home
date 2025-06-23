const express = require("express");
const mysql = require("mysql2/promise");
const mqtt = require("mqtt");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smarthome_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// MQTT Configuration
const mqttConfig = {
  broker:
    process.env.MQTT_BROKER ||
    "mqtts://ce49f6761a1a4e94bd7e855f78e02e43.s1.eu.hivemq.cloud:8883",
  username: process.env.MQTT_USERNAME || "imann",
  password: process.env.MQTT_PASSWORD || "Jokokoko111",
  clientId: process.env.MQTT_CLIENT_ID || "smarthome_backend_server",
};

// MQTT Topics
const TOPICS = {
  SENSORS: "smarthome/sensors/data",
  CLIMATE: "smarthome/climate/data",
  SECURITY: "smarthome/security/data",
  STATUS: "smarthome/status",
  ALERTS: "smarthome/alerts",
  RESPONSE: "smarthome/response",
  LIGHTS_CONTROL: "smarthome/control/lights",
  FAN_CONTROL: "smarthome/control/fan",
  LOCK_CONTROL: "smarthome/control/lock",
};

// Global variables
let db;
let mqttClient;

// Initialize Database Connection
async function initDatabase() {
  try {
    db = mysql.createPool(dbConfig);
    console.log("✅ Database connection pool created");

    // Test connection
    const connection = await db.getConnection();
    console.log("✅ Database connection established");
    connection.release();

    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

// Create database tables
async function createTables() {
  const tables = [
    // Sensor data table
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

    // Climate data table
    `CREATE TABLE IF NOT EXISTS climate_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id VARCHAR(100) NOT NULL,
      timestamp BIGINT NOT NULL,
      time_string VARCHAR(10),
      temperature FLOAT,
      humidity FLOAT,
      heat_index FLOAT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_device_timestamp (device_id, timestamp)
    )`,

    // Security events table
    `CREATE TABLE IF NOT EXISTS security_events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id VARCHAR(100) NOT NULL,
      event_type VARCHAR(50) NOT NULL,
      status VARCHAR(30) NOT NULL,
      location VARCHAR(100),
      timestamp BIGINT NOT NULL,
      time_string VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_device_timestamp (device_id, timestamp),
      INDEX idx_event_type (event_type)
    )`,

    // Device status table
    `CREATE TABLE IF NOT EXISTS device_status (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id VARCHAR(100) NOT NULL UNIQUE,
      status VARCHAR(20) NOT NULL,
      ip_address VARCHAR(45),
      wifi_rssi INT,
      wifi_quality INT,
      free_heap INT,
      uptime_seconds INT,
      firmware_version VARCHAR(20),
      time_string VARCHAR(10),
      mqtt_connected BOOLEAN,
      sensors_active BOOLEAN,
      last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // Alerts table
    `CREATE TABLE IF NOT EXISTS alerts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id VARCHAR(100) NOT NULL,
      alert_type VARCHAR(50) NOT NULL,
      priority VARCHAR(20) NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT,
      metadata JSON,
      timestamp BIGINT NOT NULL,
      time_string VARCHAR(10),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_device_timestamp (device_id, timestamp),
      INDEX idx_alert_type (alert_type),
      INDEX idx_priority (priority),
      INDEX idx_is_read (is_read)
    )`,

    // Control commands log table
    `CREATE TABLE IF NOT EXISTS control_commands (
      id INT AUTO_INCREMENT PRIMARY KEY,
      device_id VARCHAR(100),
      command_type VARCHAR(50) NOT NULL,
      action VARCHAR(30) NOT NULL,
      status VARCHAR(20) DEFAULT 'sent',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_device_timestamp (device_id, created_at)
    )`,
  ];

  for (const tableQuery of tables) {
    try {
      await db.execute(tableQuery);
    } catch (error) {
      console.error("❌ Error creating table:", error.message);
    }
  }

  console.log("✅ All database tables created/verified");
}

// Initialize MQTT Connection
function initMQTT() {
  try {
    mqttClient = mqtt.connect(mqttConfig.broker, {
      username: mqttConfig.username,
      password: mqttConfig.password,
      clientId: mqttConfig.clientId,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
    });

    mqttClient.on("connect", () => {
      console.log("✅ Connected to MQTT broker");

      // Subscribe to all relevant topics
      const subscribeTopics = [
        TOPICS.SENSORS,
        TOPICS.CLIMATE,
        TOPICS.SECURITY,
        TOPICS.STATUS,
        TOPICS.ALERTS,
      ];

      subscribeTopics.forEach((topic) => {
        mqttClient.subscribe(topic, { qos: 1 }, (err) => {
          if (err) {
            console.error(`❌ Failed to subscribe to ${topic}:`, err.message);
          } else {
            console.log(`📡 Subscribed to ${topic}`);
          }
        });
      });
    });

    mqttClient.on("message", handleMQTTMessage);

    mqttClient.on("error", (error) => {
      console.error("❌ MQTT connection error:", error.message);
    });

    mqttClient.on("reconnect", () => {
      console.log("🔄 Reconnecting to MQTT broker...");
    });
  } catch (error) {
    console.error("❌ MQTT initialization failed:", error.message);
  }
}

// Handle incoming MQTT messages
async function handleMQTTMessage(topic, message) {
  try {
    const data = JSON.parse(message.toString());
    console.log(`📥 Received message from ${topic}:`, data);

    switch (topic) {
      case TOPICS.SENSORS:
        await saveSensorData(data);
        break;
      case TOPICS.CLIMATE:
        await saveClimateData(data);
        break;
      case TOPICS.SECURITY:
        await saveSecurityEvent(data);
        break;
      case TOPICS.STATUS:
        await saveDeviceStatus(data);
        break;
      case TOPICS.ALERTS:
        await saveAlert(data);
        break;
      default:
        console.log(`❓ Unknown topic: ${topic}`);
    }
  } catch (error) {
    console.error("❌ Error handling MQTT message:", error.message);
  }
}

// Dynamic database save functions that adapt to your actual schema

// Cache for table schemas to avoid repeated queries
const tableSchemas = {};

// Function to get table schema
async function getTableSchema(tableName) {
  if (tableSchemas[tableName]) {
    return tableSchemas[tableName];
  }

  try {
    const [rows] = await db.execute(`DESCRIBE ${tableName}`);
    tableSchemas[tableName] = rows.map((row) => row.Field);
    return tableSchemas[tableName];
  } catch (error) {
    console.error(`Error getting schema for ${tableName}:`, error.message);
    return [];
  }
}

// Function to build dynamic insert query
function buildInsertQuery(tableName, availableColumns, dataFields) {
  const validFields = dataFields.filter((field) =>
    availableColumns.includes(field)
  );
  const placeholders = validFields.map(() => "?").join(", ");

  return {
    query: `INSERT INTO ${tableName} (${validFields.join(
      ", "
    )}) VALUES (${placeholders})`,
    fields: validFields,
  };
}

// Function to build dynamic upsert query
function buildUpsertQuery(
  tableName,
  availableColumns,
  dataFields,
  keyField = "device_id"
) {
  const validFields = dataFields.filter((field) =>
    availableColumns.includes(field)
  );
  const placeholders = validFields.map(() => "?").join(", ");

  const updateFields = validFields
    .filter((field) => field !== keyField)
    .map((field) => `${field} = VALUES(${field})`)
    .join(", ");

  let updateClause = updateFields;
  if (availableColumns.includes("last_seen")) {
    updateClause += updateClause
      ? ", last_seen = CURRENT_TIMESTAMP"
      : "last_seen = CURRENT_TIMESTAMP";
  }

  return {
    query: `INSERT INTO ${tableName} (${validFields.join(
      ", "
    )}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`,
    fields: validFields,
  };
}

// Dynamic save functions
async function saveSensorData(data) {
  try {
    const columns = await getTableSchema("sensor_data");
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

    const { query, fields } = buildInsertQuery(
      "sensor_data",
      columns,
      dataFields
    );
    const values = fields.map((field) => {
      if (field === "time_string") return data.time;
      return data[field];
    });

    await db.execute(query, values);
    console.log("✅ Sensor data saved to database");
  } catch (error) {
    console.error("❌ Error saving sensor data:", error.message);
  }
}

async function saveClimateData(data) {
  try {
    const columns = await getTableSchema("climate_data");
    const dataFields = [
      "device_id",
      "timestamp",
      "time_string",
      "temperature",
      "humidity",
      "heat_index",
    ];

    const { query, fields } = buildInsertQuery(
      "climate_data",
      columns,
      dataFields
    );
    const values = fields.map((field) => {
      if (field === "time_string") return data.time;
      return data[field];
    });

    await db.execute(query, values);
    console.log("✅ Climate data saved to database");
  } catch (error) {
    console.error("❌ Error saving climate data:", error.message);
  }
}

async function saveSecurityEvent(data) {
  try {
    const columns = await getTableSchema("security_events");
    const dataFields = [
      "device_id",
      "event_type",
      "status",
      "location",
      "timestamp",
      "time_string",
    ];

    const { query, fields } = buildInsertQuery(
      "security_events",
      columns,
      dataFields
    );
    const values = fields.map((field) => {
      if (field === "time_string") return data.time;
      return data[field];
    });

    await db.execute(query, values);
    console.log("✅ Security event saved to database");
  } catch (error) {
    console.error("❌ Error saving security event:", error.message);
  }
}

async function saveDeviceStatus(data) {
  try {
    const columns = await getTableSchema("device_status");
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

    const { query, fields } = buildUpsertQuery(
      "device_status",
      columns,
      dataFields
    );
    const values = fields.map((field) => {
      if (field === "time_string") return data.time;
      return data[field];
    });

    await db.execute(query, values);
    console.log("✅ Device status saved to database");
  } catch (error) {
    console.error("❌ Error saving device status:", error.message);
  }
}

async function saveAlert(data) {
  try {
    const columns = await getTableSchema("alerts");
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

    const { query, fields } = buildInsertQuery("alerts", columns, dataFields);
    const values = fields.map((field) => {
      if (field === "time_string") return data.created_at || data.time;
      if (field === "metadata") return JSON.stringify(data.metadata || {});
      return data[field];
    });

    await db.execute(query, values);
    console.log("✅ Alert saved to database");
  } catch (error) {
    console.error("❌ Error saving alert:", error.message);
  }
}

// Utility function to send MQTT commands
function sendMQTTCommand(topic, command) {
  return new Promise((resolve, reject) => {
    if (!mqttClient || !mqttClient.connected) {
      reject(new Error("MQTT client not connected"));
      return;
    }

    mqttClient.publish(topic, JSON.stringify(command), { qos: 1 }, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// REST API Routes

// Get latest sensor data
app.get("/api/sensors/latest", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1"
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get sensor data history
app.get("/api/sensors/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const [rows] = await db.execute(
      "SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get latest climate data
app.get("/api/climate/latest", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM climate_data ORDER BY created_at DESC LIMIT 1"
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get climate data history
app.get("/api/climate/history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const [rows] = await db.execute(
      "SELECT * FROM climate_data ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get security events
app.get("/api/security/events", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await db.execute(
      "SELECT * FROM security_events ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get device status
app.get("/api/devices/status", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM device_status");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get alerts
app.get("/api/alerts", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const unreadOnly = req.query.unread === "true";

    let query = "SELECT * FROM alerts";
    let params = [];

    if (unreadOnly) {
      query += " WHERE is_read = FALSE";
    }

    query += " ORDER BY created_at DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark alert as read
app.put("/api/alerts/:id/read", async (req, res) => {
  try {
    const alertId = req.params.id;
    await db.execute("UPDATE alerts SET is_read = TRUE WHERE id = ?", [
      alertId,
    ]);
    res.json({ success: true, message: "Alert marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Control lights
app.post("/api/control/lights", async (req, res) => {
  try {
    const { action } = req.body; // 'on', 'off', 'auto'

    if (!["on", "off", "auto"].includes(action)) {
      return res.status(400).json({ success: false, error: "Invalid action" });
    }

    const command = { action };
    await sendMQTTCommand(TOPICS.LIGHTS_CONTROL, command);

    // Log command
    await db.execute(
      "INSERT INTO control_commands (command_type, action) VALUES (?, ?)",
      ["lights", action]
    );

    res.json({ success: true, message: `Light ${action} command sent` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Control fan
app.post("/api/control/fan", async (req, res) => {
  try {
    const { action } = req.body; // 'on', 'off', 'auto'

    if (!["on", "off", "auto"].includes(action)) {
      return res.status(400).json({ success: false, error: "Invalid action" });
    }

    const command = { action };
    await sendMQTTCommand(TOPICS.FAN_CONTROL, command);

    // Log command
    await db.execute(
      "INSERT INTO control_commands (command_type, action) VALUES (?, ?)",
      ["fan", action]
    );

    res.json({ success: true, message: `Fan ${action} command sent` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Control door lock
app.post("/api/control/lock", async (req, res) => {
  try {
    const { action } = req.body; // 'lock', 'unlock'

    if (!["lock", "unlock"].includes(action)) {
      return res.status(400).json({ success: false, error: "Invalid action" });
    }

    const command = { action };
    await sendMQTTCommand(TOPICS.LOCK_CONTROL, command);

    // Log command
    await db.execute(
      "INSERT INTO control_commands (command_type, action) VALUES (?, ?)",
      ["lock", action]
    );

    res.json({ success: true, message: `Door ${action} command sent` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard summary
app.get("/api/dashboard", async (req, res) => {
  try {
    // Get latest data from all tables
    const [sensorData] = await db.execute(
      "SELECT * FROM sensor_data ORDER BY created_at DESC LIMIT 1"
    );

    const [climateData] = await db.execute(
      "SELECT * FROM climate_data ORDER BY created_at DESC LIMIT 1"
    );

    const [deviceStatus] = await db.execute(
      "SELECT * FROM device_status ORDER BY last_seen DESC LIMIT 1"
    );

    const [unreadAlerts] = await db.execute(
      "SELECT COUNT(*) as count FROM alerts WHERE is_read = FALSE"
    );

    const [recentEvents] = await db.execute(
      "SELECT * FROM security_events ORDER BY created_at DESC LIMIT 5"
    );

    res.json({
      success: true,
      data: {
        sensors: sensorData[0] || null,
        climate: climateData[0] || null,
        device: deviceStatus[0] || null,
        unreadAlerts: unreadAlerts[0].count,
        recentEvents: recentEvents,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: db ? "connected" : "disconnected",
    mqtt: mqttClient && mqttClient.connected ? "connected" : "disconnected",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// Initialize and start server
async function startServer() {
  try {
    console.log("🚀 Starting Smart Home Backend Server...");
    console.log("=====================================");

    // Initialize database
    await initDatabase();

    // Initialize MQTT
    initMQTT();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📱 Dashboard API: http://localhost:${PORT}/api/dashboard`);
      console.log("=====================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");

  if (mqttClient) {
    mqttClient.end();
  }

  if (db) {
    await db.end();
  }

  console.log("✅ Server shutdown complete");
  process.exit(0);
});

// Start the server
startServer();

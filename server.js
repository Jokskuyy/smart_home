const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const DatabaseService = require("./services/DatabaseService.js");
const MQTTService = require("./services/MQTTService");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: DatabaseService.isConnected() ? "connected" : "disconnected",
    mqtt: MQTTService.isConnected() ? "connected" : "disconnected",
  });
});

// Error handling
app.use(errorHandler);

// ✅ Import semua model yang butuh registrasi MQTT handler
const DeviceModel = require("./models/DeviceModel");
const SensorModel = require("./models/SensorModel");
const ClimateModel = require("./models/ClimateModel");
const SecurityModel = require("./models/SecurityModel");
const AlertModel = require("./models/AlertModel");
const ControlModel = require("./models/ControlModel");

async function startServer() {
  try {
    console.log("🚀 Starting Smart Home Backend Server...");

    // ✅ Inisialisasi database terlebih dahulu
    await DatabaseService.initialize();

    -(
      // ✅ Import model SETELAH DB siap
      (-require("./models/SensorModel"))
    );
    -require("./models/DeviceModel");
    -require("./models/ClimateModel");
    -require("./models/SecurityModel");
    -require("./models/AlertModel");
    -require("./models/ControlModel");

    // ✅ Baru inisialisasi MQTT
    await MQTTService.initialize();

    // Jalankan server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await MQTTService.disconnect();
  await DatabaseService.disconnect();
  console.log("✅ Server shutdown complete");
  process.exit(0);
});

startServer();

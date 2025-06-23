module.exports = {
  broker:
    process.env.MQTT_BROKER ||
    "mqtts://ce49f6761a1a4e94bd7e855f78e02e43.s1.eu.hivemq.cloud:8883",
  username: process.env.MQTT_USERNAME || "imann",
  password: process.env.MQTT_PASSWORD || "Jokokoko111",
  clientId: process.env.MQTT_CLIENT_ID || "smarthome_backend_server",
  topics: {
    SENSORS: "smarthome/sensors/data",
    CLIMATE: "smarthome/climate/data",
    SECURITY: "smarthome/security/data",
    STATUS: "smarthome/status",
    ALERTS: "smarthome/alerts",
    RESPONSE: "smarthome/response",
    LIGHTS_CONTROL: "smarthome/control/lights",
    FAN_CONTROL: "smarthome/control/fan",
    LOCK_CONTROL: "smarthome/control/lock",
  },
};

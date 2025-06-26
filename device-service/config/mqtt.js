module.exports = {
  broker:
    process.env.MQTT_BROKER_URL ||
    'mqtts://ce49f6761a1a4e94bd7e855f78e02e43.s1.eu.hivemq.cloud:8883',
  username: process.env.MQTT_USERNAME || 'imann',
  password: process.env.MQTT_PASSWORD || 'Jokokoko111',
  clientId: process.env.MQTT_CLIENT_ID || 'device_service_' + Math.random().toString(16).substr(2, 8),
  topics: {
    DEVICE: 'smarthome/device/data',
    STATUS: 'smarthome/status',
  },
}; 
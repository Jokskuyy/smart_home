const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt');
const Device = require('../models/DeviceModel');

class MQTTService {
  constructor() {
    this.client = null;
  }

  async initialize() {
    try {
      this.client = mqtt.connect(mqttConfig.broker, {
        username: mqttConfig.username,
        password: mqttConfig.password,
        clientId: mqttConfig.clientId,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      });

      this.client.on('connect', () => {
        console.log('✅ Connected to MQTT broker');
        this.subscribeToTopics();
      });

      this.client.on('message', this.handleMessage.bind(this));
      this.client.on('error', (error) => {
        console.error('❌ MQTT connection error:', error.message);
      });
    } catch (error) {
      console.error('❌ MQTT initialization failed:', error.message);
      throw error;
    }
  }

  subscribeToTopics() {
    const topic = mqttConfig.topics.STATUS;
    this.client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) {
        console.error(`❌ Failed to subscribe to ${topic}:`, err.message);
      } else {
        console.log(`📡 Subscribed to ${topic}`);
      }
    });
  }

  async handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📥 Received message from ${topic}:`, data);
      if (topic === mqttConfig.topics.STATUS) {
        await Device.create({
          deId: data.device_id,
          status: data.status,
          ip_address: data.ip_address,
          wifi_rssi: data.wifi_rssi,
          wifi_quality: data.wifi_quality,
          free_heap: data.free_heap,
          uptime_seconds: data.uptime_seconds,
          firmware_version: data.firmware_version,
          time: data.time,
          mqtt_connected: data.mqtt_connected,
          sensors_active: data.sensors_active,
          createdAt: new Date()
        });
        console.log('✅ Device status saved to database');
      }
    } catch (error) {
      console.error('❌ Error handling MQTT message:', error.message);
    }
  }

  async disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
}

module.exports = new MQTTService(); 
const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt');
const Sensor = require('../models/SensorModel');

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
    const topic = mqttConfig.topics.SENSORS;
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
      if (topic === mqttConfig.topics.SENSORS) {
        await Sensor.create({
          device_id: data.device_id,
          timestamp: data.timestamp,
          time_string: data.time,
          gas_level: data.gas_level,
          gas_percentage: data.gas_percentage,
          gas_ppm: data.gas_ppm,
          digital_gas: data.digital_gas,
          fire_alarm_active: data.fire_alarm_active,
          lock_status: data.lock_status,
          light_on: data.light_on,
          fan_on: data.fan_on,
          light_auto_mode: data.light_auto_mode,
          fan_auto_mode: data.fan_auto_mode,
          createdAt: new Date()
        });
        console.log('✅ Sensor data saved to database');
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
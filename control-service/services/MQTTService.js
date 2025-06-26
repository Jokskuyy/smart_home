const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt');
const Control = require('../models/ControlModel');

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
    const topics = [
      mqttConfig.topics.LIGHTS,
      mqttConfig.topics.FAN,
      mqttConfig.topics.LOCK
    ];
    topics.forEach((topic) => {
      this.client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to ${topic}:`, err.message);
        } else {
          console.log(`📡 Subscribed to ${topic}`);
        }
      });
    });
  }

  async handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📥 Received message from ${topic}:`, data);
      let commandType = '';
      if (topic === mqttConfig.topics.LIGHTS) commandType = 'lights';
      else if (topic === mqttConfig.topics.FAN) commandType = 'fan';
      else if (topic === mqttConfig.topics.LOCK) commandType = 'lock';
      else commandType = 'unknown';
      await Control.create({
        device_id: data.device_id,
        command_type: commandType,
        action: data.action,
        status: data.status || null,
        timestamp: data.timestamp || null,
        time: data.time || null,
        created_at: new Date()
      });
      console.log('✅ Control command saved to database');
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

  publish(topic, message) {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        return reject(new Error('MQTT client not connected'));
      }
      this.client.publish(topic, JSON.stringify(message), { qos: 1 }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new MQTTService(); 
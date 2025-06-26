const mqtt = require('mqtt');
const mqttConfig = require('../config/mqtt');
const Climate = require('../models/ClimateModel');

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
    const topic = mqttConfig.topics.CLIMATE;
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
      if (topic === mqttConfig.topics.CLIMATE) {
        if (typeof data.temperature === 'number' && typeof data.humidity === 'number') {
          await Climate.create({
            temperature: data.temperature,
            humidity: data.humidity,
            createdAt: new Date()
          });
          console.log('✅ Climate data saved to database');
        } else {
          console.warn('⚠️ Climate data missing temperature or humidity:', data);
        }
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
const mqtt = require("mqtt");
const mqttConfig = require("../config/mqtt");

class MQTTService {
  constructor() {
    this.client = null;
    this.messageHandlers = new Map();
  }
  registerHandler(topic, handler) {
    console.log(`🧩 Handler registered for topic: ${topic}`);
    this.messageHandlers.set(topic, handler);
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

      this.client.on("connect", () => {
        console.log("✅ Connected to MQTT broker");
        this.subscribeToTopics();
      });

      this.client.on("message", this.handleMessage.bind(this));
      this.client.on("error", (error) => {
        console.error("❌ MQTT connection error:", error.message);
      });
    } catch (error) {
      console.error("❌ MQTT initialization failed:", error.message);
      throw error;
    }
  }

  subscribeToTopics() {
    const subscribeTopics = [
      mqttConfig.topics.SENSORS,
      mqttConfig.topics.CLIMATE,
      mqttConfig.topics.SECURITY,
      mqttConfig.topics.STATUS,
      mqttConfig.topics.ALERTS,
    ];

    subscribeTopics.forEach((topic) => {
      this.client.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          console.error(`❌ Failed to subscribe to ${topic}:`, err.message);
        } else {
          console.log(`📡 Subscribed to ${topic}`);
        }
      });
    });
  }

  registerHandler(topic, handler) {
    this.messageHandlers.set(topic, handler);
  }

  async handleMessage(topic, message) {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📥 Received message from ${topic}:`, data);

      const handler = this.messageHandlers.get(topic);
      if (handler) {
        await handler(data);
      } else {
        console.log(`❓ No handler for topic: ${topic}`);
      }
    } catch (error) {
      console.error("❌ Error handling MQTT message:", error.message);
    }
  }

  publish(topic, message) {
    return new Promise((resolve, reject) => {
      if (!this.client || !this.client.connected) {
        reject(new Error("MQTT client not connected"));
        return;
      }

      this.client.publish(
        topic,
        JSON.stringify(message),
        { qos: 1 },
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  isConnected() {
    return this.client && this.client.connected;
  }

  async disconnect() {
    if (this.client) {
      this.client.end();
      this.client = null;
    }
  }
}

module.exports = new MQTTService();

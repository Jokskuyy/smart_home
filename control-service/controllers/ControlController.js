const Control = require('../models/ControlModel');
const mqttService = require('../services/MQTTService');

class ControlController {
  async getLatest(req, res) {
    try {
      const data = await Control.findOne({ order: [['created_at', 'DESC']] });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest control command' });
    }
  }

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const data = await Control.findAll({ order: [['created_at', 'DESC']], limit });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch control command history' });
    }
  }

  async controlLights(req, res) {
    const { action } = req.body;
    try {
      await mqttService.publish('smarthome/control/lights', {
        device_id: req.user?.device_id || 'api_user',
        action,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false })
      });
      res.json({ success: true, message: `Light control command '${action}' sent.` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send light control command' });
    }
  }

  async controlFan(req, res) {
    const { action } = req.body;
    try {
      await mqttService.publish('smarthome/control/fan', {
        device_id: req.user?.device_id || 'api_user',
        action,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false })
      });
      res.json({ success: true, message: `Fan control command '${action}' sent.` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send fan control command' });
    }
  }

  async controlLock(req, res) {
    const { action } = req.body;
    try {
      await mqttService.publish('smarthome/control/lock', {
        device_id: req.user?.device_id || 'api_user',
        action,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false })
      });
      res.json({ success: true, message: `Lock control command '${action}' sent.` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send lock control command' });
    }
  }
}

module.exports = new ControlController(); 
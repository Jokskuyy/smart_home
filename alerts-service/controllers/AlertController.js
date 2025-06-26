const Alert = require('../models/AlertModel');

class AlertController {
  async getLatest(req, res) {
    try {
      const data = await Alert.findOne({ order: [['created_at', 'DESC']] });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest alert' });
    }
  }

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const data = await Alert.findAll({ order: [['created_at', 'DESC']], limit });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch alert history' });
    }
  }
}

module.exports = new AlertController(); 
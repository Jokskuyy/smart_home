const Security = require('../models/SecurityModel');

class SecurityController {
  async getLatest(req, res) {
    try {
      const data = await Security.findOne({ order: [['created_at', 'DESC']] });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest security event' });
    }
  }

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const data = await Security.findAll({ order: [['created_at', 'DESC']], limit });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch security event history' });
    }
  }
}

module.exports = new SecurityController(); 
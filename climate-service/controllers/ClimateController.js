const Climate = require('../models/ClimateModel');

class ClimateController {
  async getLatest(req, res) {
    try {
      const data = await Climate.findOne({ order: [['createdAt', 'DESC']] });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest climate data' });
    }
  }

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const data = await Climate.findAll({ order: [['createdAt', 'DESC']], limit });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch climate history' });
    }
  }
}

module.exports = new ClimateController(); 
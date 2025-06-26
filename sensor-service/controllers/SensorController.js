const Sensor = require('../models/SensorModel');

class SensorController {
  async getAll(req, res) {
    try {
      const sensors = await Sensor.findAll();
      res.json(sensors);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sensors' });
    }
  }

  async getById(req, res) {
    try {
      const sensor = await Sensor.findByPk(req.params.id);
      if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
      res.json(sensor);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sensor' });
    }
  }

  async create(req, res) {
    try {
      const { type, value, unit } = req.body;
      const sensor = await Sensor.create({ type, value, unit });
      res.status(201).json(sensor);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create sensor' });
    }
  }

  async update(req, res) {
    try {
      const { type, value, unit } = req.body;
      const sensor = await Sensor.findByPk(req.params.id);
      if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
      await sensor.update({ type, value, unit });
      res.json(sensor);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update sensor' });
    }
  }

  async delete(req, res) {
    try {
      const sensor = await Sensor.findByPk(req.params.id);
      if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
      await sensor.destroy();
      res.json({ message: 'Sensor deleted' });
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete sensor' });
    }
  }

  async getLatest(req, res) {
    try {
      const data = await Sensor.findOne({ order: [['createdAt', 'DESC']] });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest sensor data' });
    }
  }

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const data = await Sensor.findAll({ order: [['createdAt', 'DESC']], limit });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch sensor history' });
    }
  }
}

module.exports = new SensorController(); 
const Device = require('../models/DeviceModel');

class DeviceController {
  async getAll(req, res) {
    try {
      const devices = await Device.findAll();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  }

  async getById(req, res) {
    try {
      const device = await Device.findByPk(req.params.id);
      if (!device) return res.status(404).json({ error: 'Device not found' });
      res.json(device);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch device' });
    }
  }

  async create(req, res) {
    try {
      const { name, type, status } = req.body;
      const device = await Device.create({ name, type, status });
      res.status(201).json(device);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create device' });
    }
  }

  async update(req, res) {
    try {
      const { name, type, status } = req.body;
      const device = await Device.findByPk(req.params.id);
      if (!device) return res.status(404).json({ error: 'Device not found' });
      await device.update({ name, type, status });
      res.json(device);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update device' });
    }
  }

  async delete(req, res) {
    try {
      const device = await Device.findByPk(req.params.id);
      if (!device) return res.status(404).json({ error: 'Device not found' });
      await device.destroy();
      res.json({ message: 'Device deleted' });
    } catch (error) {
      res.status(400).json({ error: 'Failed to delete device' });
    }
  }

  async getLatest(req, res) {
    try {
      const data = await Device.findOne({ order: [['createdAt', 'DESC']] });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch latest device data' });
    }
  }

  async getHistory(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const data = await Device.findAll({ order: [['createdAt', 'DESC']], limit });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch device history' });
    }
  }
}

module.exports = new DeviceController(); 
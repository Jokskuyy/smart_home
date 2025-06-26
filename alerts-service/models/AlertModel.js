const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alert = sequelize.define('alerts', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  device_id: { type: DataTypes.STRING, allowNull: false },
  alert_type: { type: DataTypes.STRING, allowNull: false },
  priority: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.STRING, allowNull: false },
  metadata: { type: DataTypes.JSON, allowNull: true },
  is_read: { type: DataTypes.BOOLEAN, allowNull: true },
  created_at_device: { type: DataTypes.STRING, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: false
});

module.exports = Alert; 
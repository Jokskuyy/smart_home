const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Control = sequelize.define('control_commands', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  device_id: { type: DataTypes.STRING, allowNull: false },
  command_type: { type: DataTypes.STRING, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: true },
  timestamp: { type: DataTypes.BIGINT, allowNull: true },
  time: { type: DataTypes.STRING, allowNull: true },
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  timestamps: false
});

module.exports = Control; 
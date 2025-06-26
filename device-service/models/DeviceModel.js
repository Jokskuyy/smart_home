const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Device = sequelize.define('device_status', {
  deId: { type: DataTypes.STRING, allowNull: false, field: 'device_id' },
  status: { type: DataTypes.STRING, allowNull: false },
  ip_address: { type: DataTypes.STRING, allowNull: true },
  wifi_rssi: { type: DataTypes.INTEGER, allowNull: true },
  wifi_quality: { type: DataTypes.INTEGER, allowNull: true },
  free_heap: { type: DataTypes.INTEGER, allowNull: true },
  uptime_seconds: { type: DataTypes.INTEGER, allowNull: true },
  firmware_version: { type: DataTypes.STRING, allowNull: true },
  time: { type: DataTypes.STRING, allowNull: true },
  mqtt_connected: { type: DataTypes.BOOLEAN, allowNull: true },
  sensors_active: { type: DataTypes.BOOLEAN, allowNull: true },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  updatedAt: false,
  freezeTableName: true
});

module.exports = Device; 
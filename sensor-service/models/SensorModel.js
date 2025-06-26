const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sensor = sequelize.define('sensor_data', {
  device_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  time_string: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gas_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gas_percentage: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gas_ppm: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  digital_gas: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  fire_alarm_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  lock_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  light_on: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  fan_on: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  light_auto_mode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  fan_auto_mode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  updatedAt: false,
  freezeTableName: true
});

module.exports = Sensor; 
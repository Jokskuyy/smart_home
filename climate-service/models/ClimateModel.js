const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Climate = sequelize.define('Climate', {
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  humidity: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  updatedAt: false
});

module.exports = Climate; 
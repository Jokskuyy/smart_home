require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const sensorRoutes = require('./routes/sensorRoutes');
const mqttService = require('./services/MQTTService');

const app = express();
app.use(express.json());
app.use('/sensors', sensorRoutes);

const PORT = process.env.PORT || 3004;

mqttService.initialize();

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Sensor Service running on port ${PORT}`);
  });
}); 
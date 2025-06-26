require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const deviceRoutes = require('./routes/deviceRoutes');
const MQTTService = require('./services/MQTTService');

const app = express();
app.use(express.json());
app.use('/device', deviceRoutes);

const PORT = process.env.PORT || 4002;

sequelize.sync().then(async () => {
  await MQTTService.initialize();
  app.listen(PORT, () => {
    console.log(`Device Service running on port ${PORT}`);
  });
}); 
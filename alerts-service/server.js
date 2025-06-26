require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const alertRoutes = require('./routes/alertRoutes');
const MQTTService = require('./services/MQTTService');

const app = express();
app.use(express.json());
app.use('/alerts', alertRoutes);

const PORT = process.env.PORT || 4003;

sequelize.sync().then(async () => {
  await MQTTService.initialize();
  app.listen(PORT, () => {
    console.log(`Alerts Service running on port ${PORT}`);
  });
}); 
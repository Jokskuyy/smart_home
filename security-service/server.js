require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const securityRoutes = require('./routes/securityRoutes');
const MQTTService = require('./services/MQTTService');

const app = express();
app.use(express.json());
app.use('/security', securityRoutes);

const PORT = process.env.PORT || 4004;

sequelize.sync().then(async () => {
  await MQTTService.initialize();
  app.listen(PORT, () => {
    console.log(`Security Service running on port ${PORT}`);
  });
}); 
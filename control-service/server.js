require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const controlRoutes = require('./routes/controlRoutes');
const MQTTService = require('./services/MQTTService');

const app = express();
app.use(express.json());
app.use('/control', controlRoutes);

const PORT = process.env.PORT || 4005;

sequelize.sync().then(async () => {
  await MQTTService.initialize();
  app.listen(PORT, () => {
    console.log(`Control Service running on port ${PORT}`);
  });
}); 
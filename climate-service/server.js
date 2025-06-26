require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const climateRoutes = require('./routes/climateRoutes');
const MQTTService = require('./services/MQTTService');

const app = express();
app.use(express.json());
app.use('/climate', climateRoutes);

const PORT = process.env.PORT || 4001;

sequelize.sync().then(async () => {
  await MQTTService.initialize();
  app.listen(PORT, () => {
    console.log(`Climate Service running on port ${PORT}`);
  });
}); 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwtMiddleware = require('./middleware/jwtMiddleware');
const authProxy = require('./routes/authProxy');
const climateProxy = require('./routes/climateProxy');

const app = express();
app.use(cors());

// Proxy /auth requests directly (do this BEFORE express.json)
app.use('/auth', (req, res, next) => {
  console.log('Gateway received /auth request:', req.method, req.url);
  next();
}, authProxy);

// Use express.json for any other routes you may add later
app.use(express.json());

// Protect /climate routes with JWT
app.use('/climate', jwtMiddleware, climateProxy);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
}); 
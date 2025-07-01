const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

module.exports = createProxyMiddleware({
  target: process.env.ALERTS_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: { '^/alerts': '' },
}); 
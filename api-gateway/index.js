const express = require('express');
const morgan = require('morgan');
const rateLimiter =require('./middlewares/rateLimiter')
const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { verifyJWT } = require('./middlewares/auth.js')

dotenv.config();
const app = express();


app.use(rateLimiter)
app.use(verifyJWT)
app.use(morgan('dev'));

// USER SERVICE PROXY
app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/api', 
  },
}));

app.use(
    '/api/orders',
    createProxyMiddleware({
      target: process.env.ORDER_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: { '^/api/orders': '/api' },
    })
  );

  app.use(
    '/api/agents',
    createProxyMiddleware({
      target: process.env.AGENT_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: { '^/api/agents': '/api' },
    })
  );


app.get('/health', (req, res) => res.send('Gateway running ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));

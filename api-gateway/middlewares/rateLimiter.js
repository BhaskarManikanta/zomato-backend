const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100, // limit each IP to 100 requests per window
  message: 'Too many requests, slow down 🚫',
});

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', orderRoutes);

app.get('/health', (req, res) => res.send('Order Service Running ✅'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected ✅'))
  .catch((err) => console.log('MongoDB Error ❌', err));

module.exports = app;

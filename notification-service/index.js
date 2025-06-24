import express from 'express';
import dotenv from 'dotenv';
import { initConsumer } from './kafka/consumer.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5004;

initConsumer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`📣 Notification Service running on port ${PORT}`);
    });
  })
  .catch(err => console.error('Kafka connection error:', err));


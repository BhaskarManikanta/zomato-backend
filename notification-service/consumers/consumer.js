import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import { sendNotification } from '../services/notifier.js';
dotenv.config();

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: process.env.KAFKA_BROKERS.split(',')
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

export const initConsumer = async () => {
  await consumer.connect();

  // Subscribe to both order and agent topics
  await consumer.subscribe({ topic: 'order-events', fromBeginning: true });
  await consumer.subscribe({ topic: 'agent-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const event = JSON.parse(message.value.toString());
      const { type, data } = event;

      switch (type) {
        case 'order_created':
          sendNotification({
            type,
            userId: data.userId,
            message: `Your order has been placed successfully. Order ID: ${data._id}`
          });
          break;

        case 'order_delivered':
          sendNotification({
            type,
            userId: data.userId,
            message: `Your order has been delivered! Thanks for choosing us.`
          });
          break;

        case 'order_assigned':
          sendNotification({
            type,
            userId: data.userId || '[Unknown]', // optionally enrich event later
            message: `An agent has been assigned to your order. Agent ID: ${data.agentId}`
          });
          break;

        default:
          console.log(`⚠️ Unhandled event type: ${type}`);
      }
    }
  });
};

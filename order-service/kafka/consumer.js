import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
dotenv.config();

const kafka = new Kafka({
  clientId: 'order-service-consumer',
  brokers: process.env.KAFKA_BROKERS.split(',')
});

const consumer = kafka.consumer({ groupId: 'order-agent-group' });

export const initConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'agent-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { type, data } = JSON.parse(message.value.toString());
      if (type === 'order_assigned') {
        // Update order with agent assignment
        const order = await Order.findById(data.orderId);
        if (order) {
          order.agentId = data.agentId;
          order.status = 'assigned';
          await order.save();
          console.log(`Order ${order._id} assigned to agent ${data.agentId}`);
        }
      }
    }
  });
};

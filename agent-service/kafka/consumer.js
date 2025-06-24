import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
import Agent from '../models/Agent.js';
dotenv.config();

const kafka = new Kafka({
  clientId: 'agent-service',
  brokers: process.env.KAFKA_BROKERS.split(',')
});

const consumer = kafka.consumer({ groupId: 'agent-order-group' });

export const initConsumer = async (producer) => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-events', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { type, data } = JSON.parse(message.value.toString());

if (type === 'order_created') {
  const { _id: orderId, deliveryAddress } = data;

  // Step 1: Assume deliveryAddress → coordinates (for now, stub)
  const [userLng, userLat] = deliveryAddress; // Kakinada coords

  // Step 2: Search nearest agent within 50km
  const agents = await redis.georadius('agents:locations', userLng, userLat, 10, 'km', 'WITHDIST', 'COUNT', 1, 'ASC');

  if (!agents.length) {
    console.log('❌ No nearby agent found for order', orderId);
    return;
  }

  const [nearestAgentId] = agents[0];

  const agent = await Agent.findById(nearestAgentId);
  if (!agent || agent.status !== 'available') {
    console.log('❌ Agent in Redis not available in DB');
    return;
  }

  // Step 3: Mark agent busy in DB
  agent.status = 'busy';
  await agent.save();

  // Step 4: Remove from Redis so not reused
  await redis.zrem('agents:locations', agent._id.toString());

  // Step 5: Produce Kafka event
  await producer.send({
    topic: 'agent-events',
    messages: [{
      key: 'order_assigned',
      value: JSON.stringify({
        type: 'order_assigned',
        data: { orderId, agentId: agent._id.toString() }
      })
    }]
  });

  console.log(`✅ Agent ${agent._id} assigned to Order ${orderId}`);
}
    }
  });
};

import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';
dotenv.config();

const kafka = new Kafka({
  clientId: 'agent-producer',
  brokers: process.env.KAFKA_BROKERS.split(',')
});

export const producer = kafka.producer();

export const initProducer = async () => {
  await producer.connect();
};

// kafka/kafkaClient.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'zwigato-app',
  brokers: ['localhost:9092'], 
});

module.exports = kafka;

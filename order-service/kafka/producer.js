// kafka/producer.js
const kafka = require('./kafkaClient');
const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
};

const sendMessage = async (topic, message) => {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};

module.exports = { connectProducer , sendMessage };

const amqp = require('amqplib');
const config = require('../../../config/config');

let connection;
let channel;

//* establishing a connection to RabbitMQ server
//* then creating a channel using that connection
//* then creating two new queues
const connect = async () => {
  connection = await amqp.connect(config.amqp);
  channel = await connection.createChannel();
  await channel.assertQueue('maliciousUrlDetection');
  await channel.assertQueue('deleteGossip');
};

//* receives the url and enqueues that in the maliciousUrlDetection queue
const maliciousUrlDetection = async (message) => {
  try {
    channel.sendToQueue(
      'maliciousUrlDetection',
      Buffer.from(JSON.stringify(message))
    );
    console.log(
      `enqueued message ${message.url} to maliciousUrlDetection queue`
    );
  } catch (err) {
    console.error(err);
  }
};

//* receives the gossipID and enqueues that in the deleteGossip queue
const deleteGossip = async (gossipID) => {
  try {
    channel.sendToQueue('deleteGossip', Buffer.from(gossipID));
    console.log(`enqueued message ${gossipID} to deleteGossip queue`);
  } catch (err) {
    console.error(err);
  }
};

//* waiting for the connection to be established
const startPublisher = async () => {
  await connect();
};

startPublisher();

module.exports = {
  maliciousUrlDetection,
  deleteGossip,
};

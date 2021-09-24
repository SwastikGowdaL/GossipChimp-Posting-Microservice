const amqp = require('amqplib');
const config = require('../../../config/config');

const connect = async (message) => {
  try {
    const connection = await amqp.connect(config.amqp);
    const channel = await connection.createChannel();
    await channel.assertQueue('maliciousUrlDetection');

    channel.sendToQueue(
      'maliciousUrlDetection',
      Buffer.from(JSON.stringify(message))
    );

    console.log(
      `enqueued message ${message.url} to maliciousUrlDetection queue`
    );

    await channel.close();
    await connection.close();
  } catch (err) {
    console.error(err);
  }
};

module.exports = connect;

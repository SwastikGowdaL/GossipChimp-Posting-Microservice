const amqp = require('amqplib');
const chalk = require('chalk');
const config = require('../../../config/config');

let connection;
let channel;

const { log } = console;

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
    if (config.ENV === 'dev') {
      channel.sendToQueue(
        'maliciousUrlDetection',
        Buffer.from(JSON.stringify(message))
      );
      log(
        chalk.black.bgYellowBright.bold(
          `enqueued link ${message.url} to maliciousUrlDetection queue`
        )
      );
    } else {
      console.log(
        `Testing - enqueued link ${message.url} to maliciousUrlDetection queue`
      );
      return;
    }
  } catch (err) {
    log(chalk.red(err));
  }
};

//* receives the gossipID and enqueues that in the deleteGossip queue
const deleteGossip = async (message) => {
  try {
    channel.sendToQueue('deleteGossip', Buffer.from(JSON.stringify(message)));
    log(
      chalk.black.bgYellowBright.bold(
        `enqueued gossipID ${message.gossip_id} to deleteGossip queue`
      )
    );
  } catch (err) {
    log(chalk.red(err));
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

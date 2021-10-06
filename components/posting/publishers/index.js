const amqp = require('amqplib');
// const chalk = require('chalk');
const config = require('../../../config/config');

let connection;
let channel;

const logger = require('../logger');
// const { log } = console;

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
const maliciousUrlDetection = async (message, uuid, clientDetails) => {
  logger.info('requested to enqueue url to maliciousUrlDetection queue', {
    abstractionLevel: 'publisher',
    metaData: 'maliciousUrlDetection',
    uuid,
    clientDetails,
  });
  message.uuid = uuid;
  message.clientDetails = clientDetails;
  try {
    if (config.ENV === 'dev') {
      channel.sendToQueue(
        'maliciousUrlDetection',
        Buffer.from(JSON.stringify(message))
      );
    } else {
      console.log(
        `Testing - enqueued link ${message.url} to maliciousUrlDetection queue`
      );
    }
  } catch (err) {
    logger.error(err, {
      abstractionLevel: 'publisher',
      metaData: 'error in maliciousUrlDetection publisher',
      uuid,
      clientDetails,
    });
  }
};

//* receives the gossipID and enqueues that in the deleteGossip queue
const deleteGossip = async (message, uuid, clientDetails) => {
  logger.info('requested to enqueue gossipID to deleteGossip queue', {
    abstractionLevel: 'publisher',
    metaData: 'deleteGossip',
    uuid,
    clientDetails,
  });
  message.uuid = uuid;
  message.clientDetails = clientDetails;
  try {
    channel.sendToQueue('deleteGossip', Buffer.from(JSON.stringify(message)));
  } catch (err) {
    logger.error(err, {
      abstractionLevel: 'publisher',
      metaData: 'error in  deleteGossip publisher',
      uuid,
      clientDetails,
    });
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

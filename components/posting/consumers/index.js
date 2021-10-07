const amqp = require('amqplib');
// const axios = require('axios');
const chalk = require('chalk');

const config = require('../../../config/config');
const publishers = require('../publishers');
require('../../../db/mongoose');
const helpers = require('../helpers');
const postingService = require('../postingService');

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
  await channel.assertQueue('logs');
};

//* consumes the logs from the logs queue and then sends those logs to datadog
const logsConsumer = async () => {
  channel.consume('logs', async (message) => {
    const logs = JSON.parse(message.content.toString());
    if (message) {
      try {
        await helpers.logDistinguish(logs);
        channel.ack(message);
      } catch (err) {
        console.log(err);
      }
    }
  });
};

//* consumes the messages from the maliciousUrlDetection queue and checks whether the provided link is malicious or not
const maliciousUrlDetection = async () => {
  channel.consume('maliciousUrlDetection', async (message) => {
    const msg = JSON.parse(message.content.toString());
    if (message) {
      try {
        //* log
        await publishers.logsPublisher(
          'info',
          'requested to dequeue url from maliciousUrlDetection queue and process',
          {
            abstractionLevel: 'consumer',
            metaData: 'maliciousUrlDetection',
            uuid: msg.uuid,
            clientDetails: msg.clientDetails,
          }
        );
        const isMalicious = await postingService.maliciousUrlDetection(
          msg.url,
          msg.uuid,
          msg.clientDetails
        );
        if (isMalicious) {
          log(chalk.black.bgRed.bold('link unsafe'));
          //* log
          await publishers.logsPublisher('warn', 'unsafe link detected', {
            abstractionLevel: 'consumer',
            metaData: 'maliciousUrlDetection',
            uuid: msg.uuid,
            clientDetails: msg.clientDetails,
          });
          await publishers.deleteGossip(
            {
              gossip_id: msg.gossip_id,
              author_id: msg.author_id,
            },
            msg.uuid,
            msg.clientDetails
          );
          channel.ack(message);
        } else {
          log(chalk.black.bgGreen.bold('link safe'));
          channel.ack(message);
        }
      } catch (err) {
        //* log
        await publishers.logsPublisher('error', err, {
          abstractionLevel: 'consumer',
          metaData: 'error in maliciousUrlDetection consumer',
          uuid: msg.uuid,
          clientDetails: msg.clientDetails,
        });
      }
    }
  });
};

//* consumes the messages from the deleteGossip queue and deletes the gossip
const deleteGossip = async () => {
  channel.consume('deleteGossip', async (message) => {
    const msg = JSON.parse(message.content.toString());
    if (message) {
      try {
        //* log
        await publishers.logsPublisher(
          'info',
          'requested to dequeue gossipID from deleteGossip queue and process',
          {
            abstractionLevel: 'consumer',
            metaData: 'maliciousUrlDetection',
            uuid: msg.uuid,
            clientDetails: msg.clientDetails,
          }
        );
        //* deletes the gossip by communicating with the deleteGossip service
        const deletedGossip = await postingService.deleteGossip(
          msg.gossip_id,
          msg.author_id,
          msg.uuid,
          msg.clientDetails
        );
        log(chalk.green.bold('gossip deleted'));

        //* deletes the image if there was any image stored
        const ConvertedDeletedGossip = JSON.parse(
          JSON.stringify(deletedGossip)
        );
        if (Object.hasOwn(ConvertedDeletedGossip, 'post_img')) {
          await postingService.deleteImage(
            deletedGossip.post_img,
            msg.uuid,
            msg.clientDetails
          );
          log(chalk.green.bold('image deleted'));
        }

        channel.ack(message);
      } catch (err) {
        log(chalk.red.bold(err));
        //* log
        await publishers.logsPublisher('error', err, {
          abstractionLevel: 'consumer',
          metaData: 'deleteGossip',
          uuid: msg.uuid,
          clientDetails: msg.clientDetails,
        });
      }
    }
  });
};

//* waiting for the connection to be established
const startConsumer = async () => {
  await connect();
  await maliciousUrlDetection();
  await deleteGossip();
  await logsConsumer();
};

startConsumer();

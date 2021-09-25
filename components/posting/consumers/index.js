const amqp = require('amqplib');
const axios = require('axios');
const config = require('../../../config/config');
const postingDAL = require('../postingDAL');
const publishers = require('../publishers');
require('../../../db/mongoose');
const helpers = require('../helpers');

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

//* consumes the messages from the maliciousUrlDetection queue
const maliciousUrlDetection = async () => {
  channel.consume('maliciousUrlDetection', async (message) => {
    const msg = JSON.parse(message.content.toString());
    if (message) {
      try {
        const URL = 'https://ipqualityscore.com/api/json/url/';
        const formatedLink = helpers.formatLink(msg.url);
        const response = await axios.get(
          `${URL}${config.maliciousUrlScannerKey}/${formatedLink}`
        );
        if (response.data.unsafe) {
          console.log('unsafe');
          await publishers.deleteGossip(msg.gossip_id);
          channel.ack(message);
        } else {
          console.log('safe');
          channel.ack(message);
        }
      } catch (err) {
        console.log(err);
      }
    }
  });
};

//* consumes the messages from the deleteGossip queue
const deleteGossip = async () => {
  channel.consume('deleteGossip', async (message) => {
    const msg = message.content.toString();
    if (message) {
      try {
        const deletedGossip = await postingDAL.deleteGossip(msg);
        console.log(deletedGossip);
        channel.ack(message);
      } catch (err) {
        console.log(err);
      }
    }
  });
};

//* waiting for the connection to be established
const startConsumer = async () => {
  await connect();
  await maliciousUrlDetection();
  await deleteGossip();
};

startConsumer();

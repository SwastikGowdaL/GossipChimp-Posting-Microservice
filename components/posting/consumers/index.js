const amqp = require('amqplib');
const axios = require('axios');
const config = require('../../../config/config');
const publishers = require('../publishers');
require('../../../db/mongoose');
const helpers = require('../helpers');
const postingService = require('../postingService');

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

//* consumes the messages from the maliciousUrlDetection queue and checks whether the provided link is malicious or not
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
          await publishers.deleteGossip({
            gossip_id: msg.gossip_id,
            author_id: msg.author_id,
          });
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

//* consumes the messages from the deleteGossip queue and deletes the gossip
const deleteGossip = async () => {
  channel.consume('deleteGossip', async (message) => {
    const msg = JSON.parse(message.content.toString());
    if (message) {
      try {
        //* deletes the gossip by communicating with the deleteGossip service
        const deletedGossip = await postingService.deleteGossip(
          msg.gossip_id,
          msg.author_id
        );
        console.log(deletedGossip);

        //* deletes the image if there was any image stored
        const ConvertedDeletedGossip = JSON.parse(
          JSON.stringify(deletedGossip)
        );
        if (Object.hasOwn(ConvertedDeletedGossip, 'post_img')) {
          await postingService.deleteImage(deletedGossip.post_img);
          console.log('image deleted');
        }

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

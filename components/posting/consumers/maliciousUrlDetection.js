const amqp = require('amqplib');
const axios = require('axios');
const config = require('../../../config/config');

const formatLink = (link) => {
  const separatedLink = link.split('://');
  const formatedLink = separatedLink[1].split('/');
  return formatedLink[0];
};

const connect = async () => {
  const connection = await amqp.connect(config.amqp);
  const channel = await connection.createChannel();
  await channel.assertQueue('maliciousUrlDetection');

  channel.consume('maliciousUrlDetection', async (message) => {
    const msg = JSON.parse(message.content.toString());
    if (message) {
      try {
        const URL = 'https://ipqualityscore.com/api/json/url/';
        const formatedLink = formatLink(msg.url);
        const response = await axios.get(
          `${URL}${config.maliciousUrlScannerKey}/${formatedLink}`
        );
        if (response.data.unsafe) {
          console.log('unsafe');
          channel.ack(message);
        } else {
          console.log('safe');
          channel.ack(message);
        }
      } catch (err) {
        // if (err instanceof ErrorHandler) {
        //   throw err;
        // }
        // throw new ErrorHandler(
        //   500,
        //   err.message,
        //   'error in postingService maliciousUrlDetection()',
        //   false
        // );
      }
    }
  });
};

connect();

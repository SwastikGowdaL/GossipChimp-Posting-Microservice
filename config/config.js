require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  GOSSIP_CHIMP: process.env.GOSSIP_CHIMP,
  GOSSIP_CHIMP_TEST: process.env.GOSSIP_CHIMP_TEST,
  ENV: process.env.ENV,
  AUTH_KEY: process.env.AUTH_KEY,
  IMAGE_KIT: {
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
  },
};

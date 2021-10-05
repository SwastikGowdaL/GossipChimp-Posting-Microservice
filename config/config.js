require('dotenv').config();

module.exports = {
  //* env variable will be either dev or test
  ENV: process.env.ENV,

  //* port will be 3000
  PORT: process.env.PORT,

  //* db conn for gossipChimp and another db conn while testing
  GOSSIP_CHIMP: process.env.GOSSIP_CHIMP,
  GOSSIP_CHIMP_TEST: process.env.GOSSIP_CHIMP_TEST,

  //* auth key for requests
  AUTH_KEY: process.env.AUTH_KEY,

  //* credentials for imageKit.io
  IMAGE_KIT: {
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT,
  },

  //* api key for Malicious URL Scanner
  maliciousUrlScannerKey: process.env.MALICIOUS_URL_SCANNER_KEY,
  virusTotalApiKey: process.env.VIURSTOTAL_APIKEY,

  //* amqp cloud instance url
  amqp: process.env.amqp,

  //* cloudinary secret keys
  cloudinary_cloud_name: process.env.cloudinary_cloud_name,
  cloudinary_api_key: process.env.cloudinary_api_key,
  cloudinary_api_secret: process.env.cloudinary_api_secret,

  //* Log management
  LOG: process.env.LOG,
};

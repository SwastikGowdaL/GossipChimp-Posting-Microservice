require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  GOSSIP_CHIMP: process.env.GOSSIP_CHIMP,
  GOSSIP_CHIMP_TEST: process.env.GOSSIP_CHIMP_TEST,
  ENV: process.env.ENV,
};

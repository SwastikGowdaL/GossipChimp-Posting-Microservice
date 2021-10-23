const mongoose = require('mongoose');
const config = require('../config/config');

let dbConn = config.GOSSIP_CHIMP;
if (config.ENV === 'test') {
  dbConn = config.GOSSIP_CHIMP_TEST;
}

mongoose.connect(dbConn, {
  useNewUrlParser: true,
});

mongoose.connection
  .once('open', () => {
    if (config.ENV !== 'test') {
      console.log('connected');
    }
  })
  .on('error', (error) => {
    console.log('err', error);
  });

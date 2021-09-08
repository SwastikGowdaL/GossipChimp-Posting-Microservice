const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/GossipChimp', {
  useNewUrlParser: true,
});

mongoose.connection
  .once('open', () => console.log('connected'))
  .on('error', (error) => {
    console.log('err', error);
  });

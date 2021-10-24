const app = require('../app');
const config = require('../config/config');
const { Error } = require('./indexErrors');
const postingService = require('../components/posting/postingService');

const port = config.PORT;

if (config.ENV !== 'dev') {
  throw new Error('ENV should be changed to dev');
}

// deepcode ignore PromiseNotCaughtNode: <please specify a reason of ignoring this>
postingService.load_model().then(() =>
  app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
  })
);

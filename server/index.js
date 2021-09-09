const app = require('../app');
const config = require('../config/config');
const { Error } = require('./indexErrors');

const port = config.PORT;

if (config.ENV !== 'dev') {
  throw new Error('ENV should be changed to dev');
}

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

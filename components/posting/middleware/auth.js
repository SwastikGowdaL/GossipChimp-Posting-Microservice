const config = require('../../../config/config');

const auth = async (req, res, next) => {
  const AUTH_KEY = req.header('AUTH_KEY');
  if (config.AUTH_KEY !== AUTH_KEY) {
    return res.status(401).send({
      status: 'Error',
      message: 'Unauthorized',
    });
  }
  next();
};

module.exports = auth;

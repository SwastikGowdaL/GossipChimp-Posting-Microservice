const config = require('../../../config/config');
const { ErrorHandler } = require('../postingErrors');

const auth = async (req, res, next) => {
  const AUTH_KEY = req.header('AUTH_KEY');
  if (config.AUTH_KEY !== AUTH_KEY) {
    const err = new ErrorHandler(
      401,
      'Unauthorized',
      'error in auth middleware',
      true
    );
    next(err);
  }
  next();
};

module.exports = auth;

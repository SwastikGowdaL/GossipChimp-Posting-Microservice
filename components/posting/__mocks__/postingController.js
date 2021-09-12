const postingService = require('../postingService');
const { ErrorHandler } = require('../postingErrors');

const posting = async (req, res, next) => {
  try {
    console.log('mock working');
    throw new Error('testing mock error');
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    const error = new ErrorHandler(
      500,
      err.message,
      'error in postingController posting()',
      false
    );
    next(error);
  }
};

const postingController = {
  posting,
};

module.exports = postingController;

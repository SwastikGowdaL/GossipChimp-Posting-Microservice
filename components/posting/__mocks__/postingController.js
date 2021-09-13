const { ErrorHandler } = require('../postingErrors');

const posting = async (req, res, next) => {
  try {
    throw new Error('error in posting controller');
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

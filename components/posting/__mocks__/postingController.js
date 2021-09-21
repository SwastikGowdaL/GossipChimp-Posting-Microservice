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

//* deletes the gossip
const deleteGossip = async (req, res, next) => {
  try {
    throw new Error('error in deleteGossip');
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    const error = new ErrorHandler(
      500,
      err.message,
      'error in postingController deletePost()',
      false
    );
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    throw new Error('error in deleteImage');
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    const error = new ErrorHandler(
      500,
      err.message,
      'error in postingController deleteImage()',
      false
    );
    next(error);
  }
};

const postingController = {
  posting,
  deleteGossip,
  deleteImage,
};

module.exports = postingController;

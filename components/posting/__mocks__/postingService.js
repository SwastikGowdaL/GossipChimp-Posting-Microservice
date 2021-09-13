// eslint-disable-next-line no-unused-vars
const postingDAL = require('./postingDAL');
const { ErrorHandler } = require('../postingErrors');

// eslint-disable-next-line no-unused-vars
const saveImage = async (gossipImg) => {
  try {
    throw new Error('error in posting service');
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService saveImage()',
      false
    );
  }
};

// eslint-disable-next-line no-unused-vars
const saveGossip = async (gossipBody, gossipImg) => {
  try {
    throw new Error('error in posting service');
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService saveGossip()',
      false
    );
  }
};

const postingService = {
  saveImage,
  saveGossip,
};

module.exports = postingService;

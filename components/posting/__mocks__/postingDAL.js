const ImageKit = require('imagekit');
// eslint-disable-next-line no-unused-vars
const Gossip = require('../../../models/gossip');
const config = require('../../../config/config');
const { ErrorHandler } = require('../postingErrors');

const imagekit = new ImageKit({
  publicKey: config.IMAGE_KIT.publicKey,
  privateKey: config.IMAGE_KIT.privateKey,
  urlEndpoint: config.IMAGE_KIT.urlEndpoint,
});

//* saves new gossip in the database
// eslint-disable-next-line no-unused-vars
exports.saveGossip = async (gossipBody) => {
  try {
    throw new Error('error in postingDAL');
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingDAL saveGossip()',
      false
    );
  }
};

//* uploads the image to imageKit.io and returns the uploaded image url
exports.saveImage = async (gossipImg) =>
  new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: gossipImg.buffer, // required
        fileName: gossipImg.originalName, // required
        folder: gossipImg.folder,
      },
      function (error, result) {
        reject(new Error('error in postingDAL'));
      }
    );
  });

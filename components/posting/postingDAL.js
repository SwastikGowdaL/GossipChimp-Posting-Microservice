const ImageKit = require('imagekit');
const Gossip = require('../../models/gossip');
const config = require('../../config/config');
const { ErrorHandler } = require('./postingErrors');

const imagekit = new ImageKit({
  publicKey: config.IMAGE_KIT.publicKey,
  privateKey: config.IMAGE_KIT.privateKey,
  urlEndpoint: config.IMAGE_KIT.urlEndpoint,
});

//* saves new gossip in the database
exports.saveGossip = async (gossipBody) => {
  try {
    const gossip = new Gossip(gossipBody);
    return await gossip.save();
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

//* uploads the image to imageKit.io and returns the uploaded image details
exports.saveImage = async (gossipImg) =>
  new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: gossipImg.buffer, // required
        fileName: gossipImg.originalName, // required
        folder: gossipImg.folder,
      },
      function (error, result) {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });

//* deletes the gossip
exports.deleteGossip = async (gossipID) => {
  try {
    const gossip = await Gossip.findByIdAndDelete(gossipID);
    if (!gossip) {
      throw new ErrorHandler(
        404,
        'gossip not found for it to be deleted',
        'error in postingDAL deleteGossip()',
        false
      );
    }
    return gossip;
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingDAL deleteGossip()',
      false
    );
  }
};

//* finds the gossip for the specified gossipID
exports.gossip = async (gossipID) => {
  try {
    const gossip = await Gossip.findById(gossipID);

    //* checks whether the gossip was found or not
    if (!gossip) {
      throw new ErrorHandler(
        404,
        'gossip not found',
        'error in postingDAL deleteGossip()',
        true
      );
    }
    return gossip;
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingDAL gossip()',
      false
    );
  }
};

exports.deleteImage = async (imageID) =>
  new Promise((resolve, reject) => {
    imagekit.deleteFile(imageID, function (error1, result1) {
      if (error1) {
        console.log(error1);
        reject(error1);
      } else {
        resolve(result1);
      }
    });
  });

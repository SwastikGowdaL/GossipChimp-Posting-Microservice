const ImageKit = require('imagekit');
const cloudinary = require('cloudinary');
const chalk = require('chalk');

const Gossip = require('../../models/gossip');
const config = require('../../config/config');
const { ErrorHandler } = require('./postingErrors');

const imagekit = new ImageKit({
  publicKey: config.IMAGE_KIT.publicKey,
  privateKey: config.IMAGE_KIT.privateKey,
  urlEndpoint: config.IMAGE_KIT.urlEndpoint,
});

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

const { log } = console;

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
          log(chalk.red(error));
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

//* deletes the image from the imagekit
exports.deleteImage = async (imageID) =>
  new Promise((resolve, reject) => {
    imagekit.deleteFile(imageID, function (error1, result1) {
      if (error1) {
        log(chalk.red(error1));
        reject(error1);
      } else {
        resolve(result1);
      }
    });
  });

//* deletes the image from cloudinary
exports.deleteBackupImage = async (publicID) =>
  cloudinary.v2.uploader.destroy(publicID, {}, function (error, result) {
    if (error) {
      log(chalk.red(error));
    }
    return result;
  });

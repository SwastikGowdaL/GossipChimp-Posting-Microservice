const ImageKit = require('imagekit');
const cloudinary = require('cloudinary');
// const chalk = require('chalk');

const publishers = require('./publishers');
const logger = require('./logger');
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

// const { log } = console;

//* saves new gossip in the database
exports.saveGossip = async (gossipBody, uuid, clientDetails) => {
  await publishers.logsPublisher('info', 'requested saveGossip DAL', {
    abstractionLevel: 'DAL',
    metaData: 'saveGossip',
    uuid,
    clientDetails,
  });
  try {
    const gossip = new Gossip(gossipBody);
    return await gossip.save();
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'DAL',
      metaData: 'error in saveGossip',
      uuid,
      clientDetails,
    });
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingDAL saveGossip()',
      false
    );
  }
};

//* uploads the image to imageKit.io and returns the uploaded image details
exports.saveImage = async (gossipImg, uuid, clientDetails) =>
  new Promise((resolve, reject) => {
    publishers.logsPublisher('info', 'requested saveImage DAL', {
      abstractionLevel: 'DAL',
      metaData: 'saveImage',
      uuid,
      clientDetails,
    });
    imagekit.upload(
      {
        file: gossipImg.buffer, // required
        fileName: gossipImg.originalName, // required
        folder: gossipImg.folder,
      },
      function (error, result) {
        if (error) {
          logger.error(error, {
            abstractionLevel: 'DAL',
            metaData: 'error in saveGossip',
            uuid,
            clientDetails,
          });
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });

//* deletes the gossip
exports.deleteGossip = async (gossipID, uuid, clientDetails) => {
  await publishers.logsPublisher('info', 'requested deleteGossip DAL', {
    abstractionLevel: 'DAL',
    metaData: 'deleteGossip',
    uuid,
    clientDetails,
  });
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
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'DAL',
      metaData: 'error in deleteGossip',
      uuid,
      clientDetails,
    });
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingDAL deleteGossip()',
      false
    );
  }
};

//* finds the gossip for the specified gossipID
exports.gossip = async (gossipID, uuid, clientDetails) => {
  await publishers.logsPublisher('info', 'requested gossip DAL', {
    abstractionLevel: 'DAL',
    metaData: 'gossip',
    uuid,
    clientDetails,
  });
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
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'DAL',
      metaData: 'error in gossip',
      uuid,
      clientDetails,
    });
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingDAL gossip()',
      false
    );
  }
};

//* deletes the image from the imagekit
exports.deleteImage = async (imageID, uuid, clientDetails) =>
  new Promise((resolve, reject) => {
    publishers.logsPublisher('info', 'requested deleteImage DAL', {
      abstractionLevel: 'DAL',
      metaData: 'deleteImage',
      uuid,
      clientDetails,
    });
    imagekit.deleteFile(imageID, function (error1, result1) {
      if (error1) {
        logger.error(error1, {
          abstractionLevel: 'DAL',
          metaData: 'error in deleteImage',
          uuid,
          clientDetails,
        });
        reject(error1);
      } else {
        resolve(result1);
      }
    });
  });

//* deletes the image from cloudinary
exports.deleteBackupImage = async (publicID, uuid, clientDetails) => {
  await publishers.logsPublisher('info', 'requested deleteBackupImage DAL', {
    abstractionLevel: 'DAL',
    metaData: 'deleteBackupImage',
    uuid,
    clientDetails,
  });
  return cloudinary.v2.uploader.destroy(publicID, {}, function (error, result) {
    if (error) {
      logger.error(error, {
        abstractionLevel: 'DAL',
        metaData: 'error in deleteBackupImage',
        uuid,
        clientDetails,
      });
    }
    return result;
  });
};

const cloudinary = require('cloudinary');
const streamifier = require('streamifier');
// const chalk = require('chalk');

const config = require('../../../config/config');
const postingDAL = require('../postingDAL');
const helpers = require('../helpers');
const logger = require('../logger');

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

// const { log } = console;

//* storing image in cloudinary
const uploadFromBuffer = async (gossipImg) =>
  new Promise((resolve, reject) => {
    const uniqueImageName = helpers.uniqueImageName(gossipImg.originalName);
    const cldUploadStream = cloudinary.v2.uploader.upload_stream(
      {
        public_id: uniqueImageName,
        folder: 'GossipPics',
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(gossipImg.buffer).pipe(cldUploadStream);
  });

//* saving image in imageKit by communicating with DAL layer, if it fails to store it in imageKit then storing it in cloudinary
const saveImage = async (gossipImg, uuid, clientDetails) => {
  logger.info('requested saveImage Proxy', {
    abstractionLevel: 'Proxy',
    metaData: 'saveImage',
    uuid,
    clientDetails,
  });
  try {
    const imageData = await postingDAL.saveImage(
      gossipImg,
      uuid,
      clientDetails
    );
    return {
      fileId: imageData.fileId,
      url: imageData.url,
      service: 'imageKit',
    };
  } catch (err) {
    // log(chalk.red(err));
    logger.error(err, {
      abstractionLevel: 'Proxy',
      metaData: 'error in saveImage Proxy',
      uuid,
      clientDetails,
    });
    const backupImageData = await uploadFromBuffer(gossipImg);
    logger.warn(err, {
      abstractionLevel: 'Proxy',
      metaData:
        'Image uploaded to backup asset management service - cloudinary',
      uuid,
      clientDetails,
    });
    return {
      fileId: backupImageData.public_id,
      url: backupImageData.secure_url,
      service: 'cloudinary',
    };
  }
};

module.exports = saveImage;

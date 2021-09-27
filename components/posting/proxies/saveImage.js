const cloudinary = require('cloudinary');
const streamifier = require('streamifier');

const config = require('../../../config/config');
const postingDAL = require('../postingDAL');
const helpers = require('../helpers');

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

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
const saveImage = async (gossipImg) => {
  try {
    const imageData = await postingDAL.saveImage(gossipImg);
    return {
      fileId: imageData.fileId,
      url: imageData.url,
      service: 'imageKit',
    };
  } catch (err) {
    console.log(err);
    const backupImageData = await uploadFromBuffer(gossipImg);
    console.log('image uploaded to backup image management - cloudinary');
    return {
      fileId: backupImageData.public_id,
      url: backupImageData.secure_url,
      service: 'cloudinary',
    };
  }
};

module.exports = saveImage;

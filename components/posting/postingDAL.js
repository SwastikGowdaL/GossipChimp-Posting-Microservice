const ImageKit = require('imagekit');
const Gossip = require('../../models/gossip');
const config = require('../../config/config');

const imagekit = new ImageKit({
  publicKey: config.IMAGE_KIT.publicKey,
  privateKey: config.IMAGE_KIT.privateKey,
  urlEndpoint: config.IMAGE_KIT.urlEndpoint,
});

//* saves new gossip in the database
exports.saveGossip = async (gossipBody) => {
  const gossip = new Gossip(gossipBody);
  await gossip.save();
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
        if (error) {
          reject(error);
        } else {
          resolve(result.url);
        }
      }
    );
  });

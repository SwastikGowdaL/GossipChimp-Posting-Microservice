const nsfw = require('nsfwjs');
const Filter = require('bad-words');
const axios = require('axios');
const chalk = require('chalk');

const helpers = require('./helpers');
const postingDAL = require('./postingDAL');
const { ErrorHandler } = require('./postingErrors');
const config = require('../../config/config');
const publishers = require('./publishers');
const proxies = require('./proxies');

//* this variable is used to load the models needed for imageModeration
let _model;

// eslint-disable-next-line camelcase
const load_model = async () => {
  _model = await nsfw.load();
};

const { log } = console;

//* uses the nsfw module and returns the imageSerenity level
const imageModeration = async (image) => {
  try {
    const convertedImage = await helpers.convert(image.buffer, image.mimeType);
    const predictions = await _model.classify(convertedImage);
    convertedImage.dispose();
    return helpers.serenityCalculation(predictions);
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService imageModeration()',
      false
    );
  }
};

//* moderates whether the image is safe or not, if it is, then sends the image to Proxy saveImage for it to be saved in imagekit
const saveImage = async (gossipImg) => {
  try {
    const imageSerenity = await imageModeration(gossipImg);
    if (imageSerenity === 'unsafe') {
      throw new ErrorHandler(
        400,
        'Adult rated content not allowed!',
        'Adult rated content error in postingService saveImage()',
        true
      );
    }
    return await proxies.saveImage(gossipImg);
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

//* checks whether the provided link is malicious or not
const maliciousUrlDetection = async (link) => {
  try {
    const URL = 'https://ipqualityscore.com/api/json/url/';
    const formatedLink = helpers.formatLink(link);
    const response = await axios.get(
      `${URL}${config.maliciousUrlScannerKey}/${formatedLink}`
    );
    return response.data.unsafe;
  } catch (err) {
    log(chalk.red(err));
  }
};

//* checks whether the provided text is profane or not, if it is profane then cleans it and returns the text, if not then returns as it is
const badWordsFilter = async (text) => {
  const filter = new Filter();
  if (filter.isProfane(text)) {
    return filter.clean(text);
  }
  return text;
};

//* saves the gossip & if image and link are there, then saves them as well
const saveGossip = async (gossipBody, gossipImg) => {
  try {
    //* storing sanitized text in gossipBody.gossip
    gossipBody.gossip = await badWordsFilter(gossipBody.gossip);

    //* checking whether the user provided an image
    if (gossipImg) {
      const imageData = await saveImage(gossipImg);
      gossipBody.post_img = imageData;
    }

    const savedGossip = await postingDAL.saveGossip(gossipBody);

    //* checking whether the user provided a link
    if (gossipBody.link) {
      await publishers.maliciousUrlDetection({
        url: savedGossip.link,
        gossip_id: savedGossip._id,
        author_id: savedGossip.author_id,
      });
    }
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

//* deletes the gossip only after checking whether the provided authorID matches the actual gossip authorID
const deleteGossip = async (gossipID, authorID) => {
  try {
    const gossip = await postingDAL.gossip(gossipID);

    //* checks whether the provided authorID doesn't match the actual gossip authorID
    if (gossip.author_id !== authorID) {
      throw new ErrorHandler(
        500,
        'author of the gossip to be deleted not matching',
        'error in postingService deleteGossip()',
        false
      );
    }

    return await postingDAL.deleteGossip(gossipID);
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService deleteGossip()',
      false
    );
  }
};

//* deletes an image by checking whether it is stored in imageKit or cloudinary then by communicating with the DAL layer
const deleteImage = async (imageDetails) => {
  try {
    if (imageDetails.service === 'imageKit') {
      return await postingDAL.deleteImage(imageDetails.fileId);
    }
    return await postingDAL.deleteBackupImage(imageDetails.fileId);
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService deleteImage()',
      false
    );
  }
};

const postingService = {
  saveImage,
  saveGossip,
  load_model,
  deleteGossip,
  deleteImage,
  maliciousUrlDetection,
};

module.exports = postingService;

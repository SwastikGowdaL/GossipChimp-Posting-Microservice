const nsfw = require('nsfwjs');
const Filter = require('bad-words');

const helpers = require('./helpers');
const postingDAL = require('./postingDAL');
const { ErrorHandler } = require('./postingErrors');

//* this variable is used to load the models needed for imageModeration
let _model;

// eslint-disable-next-line camelcase
const load_model = async () => {
  _model = await nsfw.load();
};

//* uses the nsfw module and returns the imageSerenity level
const imageModeration = async (image) => {
  const convertedImage = await helpers.convert(image.buffer, image.mimeType);
  const predictions = await _model.classify(convertedImage);
  convertedImage.dispose();
  return helpers.serenityCalculation(predictions);
};

//* moderates whether the image is safe or not, if it is, then sends the image to DAL layer for it to be saved in imagekit
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
    const imageData = await postingDAL.saveImage(gossipImg);
    return imageData.url;
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

//* checks whether the provided text is profane or not, if it is then cleans it and returns the text, if not then returns as it is
const badWordsFilter = async (text) => {
  const filter = new Filter();
  if (filter.isProfane(text)) {
    return filter.clean(text);
  }
  return text;
};

//* saves the gossip & if image is there, then saves it as well
const saveGossip = async (gossipBody, gossipImg) => {
  try {
    gossipBody.gossip = await badWordsFilter(gossipBody.gossip);
    if (gossipImg) {
      const imageUrl = await saveImage(gossipImg);
      gossipBody.post_img = imageUrl;
    }
    await postingDAL.saveGossip(gossipBody);
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
  load_model,
};

module.exports = postingService;

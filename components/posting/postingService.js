const jpeg = require('jpeg-js');
const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');
const sharp = require('sharp');
const { PNG } = require('pngjs');
const Filter = require('bad-words');

const postingDAL = require('./postingDAL');
const { ErrorHandler } = require('./postingErrors');

//* this variable is used to load the models needed for imageModeration
let _model;

// eslint-disable-next-line camelcase
const load_model = async () => {
  _model = await nsfw.load();
};

//* Decoded image in UInt8 Byte array and if image in svg/gif/webp format converts it to jpg and then decodes it
const imgDecode = async (imgBuffer, imgType) => {
  let image;
  if (imgType === 'image/jpg' || imgType === 'image/jpeg') {
    image = await jpeg.decode(imgBuffer, true);
  } else if (imgType === 'image/png') {
    image = PNG.sync.read(imgBuffer);
  } else if (
    imgType === 'image/svg+xml' ||
    imgType === 'image/gif' ||
    imgType === 'image/webp'
  ) {
    const buffer = await sharp(imgBuffer).jpeg().toBuffer();
    image = await jpeg.decode(buffer, true);
  }
  return image;
};

//* converting the image to the format that can be understood by the nsfw library
const convert = async (imgBuffer, imgType) => {
  const image = await imgDecode(imgBuffer, imgType);
  const numChannels = 3;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c];

  return tf.tensor3d(values, [image.height, image.width, numChannels], 'int32');
};

//* evaluates whether the predictions are safe or unsafe based on the probability and serenityLevel
const predictionEvaluator = (prediction) => {
  const serenityLevel = 30;
  if (
    prediction.className === 'Hentai' ||
    prediction.className === 'Porn' ||
    prediction.className === 'Sexy'
  ) {
    const convertedProbability = prediction.probability * 100;
    if (convertedProbability > serenityLevel) {
      return 'unsafe';
    }
  }
  return 'safe';
};

//* calculates and returns whether the imageSerenity is safe or unsafe, by checking the first two arg of predictions
const serenityCalculation = async (predictions) => {
  if (
    predictionEvaluator(predictions[0]) === 'unsafe' ||
    predictionEvaluator(predictions[1]) === 'unsafe'
  ) {
    return 'unsafe';
  }
  return 'safe';
};

//* uses the nsfw module and returns the imageSerenity level
const imageModeration = async (image) => {
  const convertedImage = await convert(image.buffer, image.mimeType);
  const predictions = await _model.classify(convertedImage);
  convertedImage.dispose();
  return serenityCalculation(predictions);
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

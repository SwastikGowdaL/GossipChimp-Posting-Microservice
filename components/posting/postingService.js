const jpeg = require('jpeg-js');
const tf = require('@tensorflow/tfjs-node');
const nsfw = require('nsfwjs');
const sharp = require('sharp');
const { PNG } = require('pngjs');

let _model;

const postingDAL = require('./postingDAL');
const { ErrorHandler } = require('./postingErrors');

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

//* calculates and returns whether the imageSerenity is safe or unsafe based on the probability and serenityLevel
const serenityCalculation = async (predictions) => {
  const serenityLevel = 30;
  if (
    predictions[0].className === 'Hentai' ||
    predictions[0].className === 'Porn' ||
    predictions[0].className === 'Sexy'
  ) {
    const convertedProbability = predictions[0].probability * 100;
    if (convertedProbability > serenityLevel) {
      return 'unsafe';
    }
  } else if (
    predictions[1].className === 'Hentai' ||
    predictions[1].className === 'Porn' ||
    predictions[1].className === 'Sexy'
  ) {
    const convertedProbability = predictions[1].probability * 100;
    if (convertedProbability > serenityLevel) {
      return 'unsafe';
    }
  } else {
    return 'safe';
  }
};

//* uses the nsfw module and returns the imageSerenity level
const imageModeration = async (image) => {
  const convertedImage = await convert(image.buffer, image.mimeType);
  const predictions = await _model.classify(convertedImage);
  convertedImage.dispose();
  return serenityCalculation(predictions);
};

//* moderates whether the image is safe, if it is, then sends the image to DAL layer for it to be saved in imagekit
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

//* saves the gossip & if image is there, then saves it as well
const saveGossip = async (gossipBody, gossipImg) => {
  try {
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

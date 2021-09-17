const jpeg = require('jpeg-js');
const sharp = require('sharp');
const { PNG } = require('pngjs');

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

module.exports = imgDecode;

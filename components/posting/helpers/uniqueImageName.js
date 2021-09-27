const ShortUniqueId = require('short-unique-id');

const uid = new ShortUniqueId({ length: 10 });

const uniqueImageName = (imageName) => {
  const splitName = imageName.split('.');
  return `${splitName[0]}_${uid()}`;
};

module.exports = uniqueImageName;

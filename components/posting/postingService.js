const postingDAL = require('./postingDAL');
const { ErrorHandler } = require('./postingErrors');

const saveImage = async (gossipImg) => {
  try {
    return await postingDAL.saveImage(gossipImg);
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

const saveGossip = async (gossipBody, gossipImg) => {
  if (gossipImg) {
    const imageUrl = await saveImage(gossipImg);
    gossipBody.post_img = imageUrl;
  }
  try {
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
};

module.exports = postingService;

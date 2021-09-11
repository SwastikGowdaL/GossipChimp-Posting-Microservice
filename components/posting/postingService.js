const postingDAL = require('./postingDAL');

const saveImage = async (gossipImg) => postingDAL.saveImage(gossipImg);

const saveGossip = async (gossipBody, gossipImg) => {
  if (gossipImg) {
    const imageUrl = await saveImage(gossipImg);
    gossipBody.post_img = imageUrl;
  }
  await postingDAL.saveGossip(gossipBody);
};

const postingService = {
  saveImage,
  saveGossip,
};

module.exports = postingService;

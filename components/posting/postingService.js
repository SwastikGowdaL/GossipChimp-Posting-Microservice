const postingDAL = require('./postingDAL');

exports.saveGossip = async (gossipBody) => {
  await postingDAL.saveGossip(gossipBody);
};

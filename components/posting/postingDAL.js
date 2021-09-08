const Gossip = require('../../models/gossip');

exports.saveGossip = async (gossipBody) => {
  const gossip = new Gossip(gossipBody);
  await gossip.save();
};

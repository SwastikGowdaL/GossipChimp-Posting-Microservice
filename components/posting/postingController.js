const postingService = require('./postingService');

exports.posting = async (req, res) => {
  try {
    const gossipBody = JSON.parse(JSON.stringify(req.body)); // deeply cloning the req.body
    let gossipImg;
    if (req.file) {
      gossipImg = {
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        folder: 'GossipPics',
      };
    }
    await postingService.saveGossip(gossipBody, gossipImg);
    res.status(201).send({
      status: 'success',
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

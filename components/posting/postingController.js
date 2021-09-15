const postingService = require('./postingService');
const { ErrorHandler } = require('./postingErrors');

const posting = async (req, res, next) => {
  try {
    const gossipBody = JSON.parse(JSON.stringify(req.body)); // deeply cloning the req.body
    let gossipImg;
    if (req.file) {
      gossipImg = {
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        folder: 'GossipPics',
        mimeType: req.file.mimetype,
      };
    }
    await postingService.saveGossip(gossipBody, gossipImg);
    res.status(201).send({
      status: 'success',
    });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    const error = new ErrorHandler(
      500,
      err.message,
      'error in postingController posting()',
      false
    );
    next(error);
  }
};

const postingController = {
  posting,
};

module.exports = postingController;

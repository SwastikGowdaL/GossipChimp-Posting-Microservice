const postingService = require('./postingService');
const { ErrorHandler } = require('./postingErrors');

//* saves the gossip
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

//* deletes the gossip
const deleteGossip = async (req, res, next) => {
  try {
    const gossipID = req.body.gossip_id;
    const authorID = req.body.author_id;
    await postingService.deleteGossip(gossipID, authorID);
    res.status(200).send({ status: 'success', message: 'post deleted' });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    const error = new ErrorHandler(
      500,
      err.message,
      'error in postingController deletePost()',
      false
    );
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const imageID = req.body.image_id;
    await postingService.deleteImage(imageID);
    res.status(200).send({
      status: 'success',
      message: 'image deleted',
    });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    const error = new ErrorHandler(
      500,
      err.message,
      'error in postingController deleteImage()',
      false
    );
    next(error);
  }
};

const postingController = {
  posting,
  deleteGossip,
  deleteImage,
};

module.exports = postingController;

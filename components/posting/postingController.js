const postingService = require('./postingService');
const { ErrorHandler } = require('./postingErrors');
const logger = require('./logger');

//* saves the gossip
const posting = async (req, res, next) => {
  logger.info('posting request received', {
    abstractionLevel: 'controller',
    metaData: 'posting',
  });
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
    logger.error(err, {
      abstractionLevel: 'controller',
      metaData: 'error in posting',
    });
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
    logger.info('delete request received', {
      abstractionLevel: 'controller',
      metaData: 'deleteGossip',
    });
    const gossipID = req.body.gossip_id;
    const authorID = req.body.author_id;
    await postingService.deleteGossip(gossipID, authorID);
    res.status(200).send({ status: 'success', message: 'post deleted' });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    logger.error(err, {
      abstractionLevel: 'controller',
      metaData: 'error in deleteGossip',
    });
    const error = new ErrorHandler(
      500,
      err.message,
      'error in postingController deletePost()',
      false
    );
    next(error);
  }
};

//! this is going to work only when the whole post_img details are provided
const deleteImage = async (req, res, next) => {
  try {
    logger.info('delete image request received', {
      abstractionLevel: 'controller',
      metaData: 'deleteImage',
    });
    const imageDetails = {
      fileId: req.body.fileId,
      service: req.body.service,
    };
    await postingService.deleteImage(imageDetails);
    res.status(200).send({
      status: 'success',
      message: 'image deleted',
    });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    logger.error(err, {
      abstractionLevel: 'controller',
      metaData: 'error in deleteImage',
    });
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

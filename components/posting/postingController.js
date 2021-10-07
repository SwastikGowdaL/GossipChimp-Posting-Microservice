const postingService = require('./postingService');
const { ErrorHandler } = require('./postingErrors');
const helpers = require('./helpers');
const publishers = require('./publishers');

//* saves the gossip
const posting = async (req, res, next) => {
  await publishers.logsPublisher('info', 'posting request received', {
    abstractionLevel: 'controller',
    metaData: 'posting',
    uuid: req.body.uuid,
    clientDetails: helpers.userAgent(req.useragent, req.ip),
  });

  const { uuid } = req.body;
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
    await postingService.saveGossip(
      gossipBody,
      gossipImg,
      uuid,
      helpers.userAgent(req.useragent, req.ip)
    );
    res.status(201).send({
      status: 'success',
    });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'controller',
      metaData: 'error in posting',
      uuid: req.body.uuid,
      clientDetails: helpers.userAgent(req.useragent, req.ip),
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
    await publishers.logsPublisher('info', 'delete request received', {
      abstractionLevel: 'controller',
      metaData: 'deleteGossip',
      uuid: req.body.uuid,
      clientDetails: helpers.userAgent(req.useragent, req.ip),
    });
    const gossipID = req.body.gossip_id;
    const authorID = req.body.author_id;
    const { uuid } = req.body;
    await postingService.deleteGossip(
      gossipID,
      authorID,
      uuid,
      helpers.userAgent(req.useragent, req.ip)
    );
    res.status(200).send({ status: 'success', message: 'post deleted' });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'controller',
      metaData: 'error in deleteGossip',
      uuid: req.body.uuid,
      clientDetails: helpers.userAgent(req.useragent, req.ip),
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
    await publishers.logsPublisher('info', 'delete image request received', {
      abstractionLevel: 'controller',
      metaData: 'deleteImage',
      uuid: req.body.uuid,
      clientDetails: helpers.userAgent(req.useragent, req.ip),
    });
    const imageDetails = {
      fileId: req.body.fileId,
      service: req.body.service,
    };
    const { uuid } = req.body;
    await postingService.deleteImage(
      imageDetails,
      uuid,
      helpers.userAgent(req.useragent, req.ip)
    );
    res.status(200).send({
      status: 'success',
      message: 'image deleted',
    });
  } catch (err) {
    if (err instanceof ErrorHandler) {
      next(err);
    }
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'controller',
      metaData: 'error in deleteImage',
      uuid: req.body.uuid,
      clientDetails: helpers.userAgent(req.useragent, req.ip),
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

const nsfw = require('nsfwjs');
const Filter = require('bad-words');
const axios = require('axios');
const redis = require('redis');
// const chalk = require('chalk');

const helpers = require('./helpers');
const postingDAL = require('./postingDAL');
const { ErrorHandler } = require('./postingErrors');
const config = require('../../config/config');
const publishers = require('./publishers');
const proxies = require('./proxies');

const redisClient = redis.createClient();

const DEFAULT_EXPIRATION = 86400;
const CACHE_LIMIT = 10;

//* this variable is used to load the models needed for imageModeration
let _model;

// eslint-disable-next-line camelcase
const load_model = async () => {
  _model = await nsfw.load();
};

// const { log } = console;

//* uses the nsfw module and returns the imageSerenity level
const imageModeration = async (image, uuid, clientDetails) => {
  //* log
  await publishers.logsPublisher('info', 'requested image moderation service', {
    abstractionLevel: 'service',
    metaData: 'imageModeration',
    uuid,
    clientDetails,
  });
  try {
    const convertedImage = await helpers.convert(image.buffer, image.mimeType);
    const predictions = await _model.classify(convertedImage);
    convertedImage.dispose();
    return helpers.serenityCalculation(predictions);
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    //* log
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'service',
      metaData: 'error in imageModeration',
      uuid,
      clientDetails,
    });
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService imageModeration()',
      false
    );
  }
};

//* moderates whether the image is safe or not, if it is, then sends the image to Proxy saveImage for it to be saved in imagekit
const saveImage = async (gossipImg, uuid, clientDetails) => {
  //* log
  await publishers.logsPublisher('info', 'requested save Image service', {
    abstractionLevel: 'service',
    metaData: 'saveImage',
    uuid,
    clientDetails,
  });
  try {
    const imageSerenity = await imageModeration(gossipImg, uuid, clientDetails);
    if (imageSerenity === 'unsafe') {
      //* log
      await publishers.logsPublisher('warn', 'image serenity unsafe', {
        abstractionLevel: 'service',
        metaData: 'image serenity unsafe',
        uuid,
        clientDetails,
      });
      throw new ErrorHandler(
        400,
        'Adult rated content not allowed!',
        'Adult rated content error in postingService saveImage()',
        true
      );
    }
    return await proxies.saveImage(gossipImg, uuid, clientDetails);
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    //* log
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'service',
      metaData: 'error in saveImage',
      uuid,
      clientDetails,
    });
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService saveImage()',
      false
    );
  }
};

//* checks whether the provided link is malicious or not
const maliciousUrlDetection = async (link, uuid, clientDetails) => {
  //* log
  await publishers.logsPublisher(
    'info',
    'requested maliciousUrlDetection service',
    {
      abstractionLevel: 'service',
      metaData: 'maliciousUrlDetection',
      uuid,
      clientDetails,
    }
  );
  try {
    const URL = 'https://ipqualityscore.com/api/json/url/';
    const formatedLink = helpers.formatLink(link);
    const response = await axios.get(
      `${URL}${config.maliciousUrlScannerKey}/${formatedLink}`
    );
    return response.data.unsafe;
  } catch (err) {
    //* log
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'service',
      metaData: 'error in maliciousUrlDetection',
      uuid,
      clientDetails,
    });
  }
};

//* checks whether the provided text is profane or not, if it is profane then cleans it and returns the text, if not then returns as it is
const badWordsFilter = async (text, uuid, clientDetails) => {
  //* log
  await publishers.logsPublisher('info', 'requested badWordsFilter service', {
    abstractionLevel: 'service',
    metaData: 'badWordsFilter',
    uuid,
    clientDetails,
  });
  const filter = new Filter();
  if (filter.isProfane(text)) {
    return filter.clean(text);
  }
  return text;
};

//* caches the gossipID by communicating with DAL layer
const cacheGossipID = async (authorID, gossipID) => {
  try {
    await postingDAL.cacheGossipID(authorID, gossipID);
    const countOfCachedGossips = await postingDAL.countOfCachedGossips(
      authorID
    );
    if (countOfCachedGossips > CACHE_LIMIT) {
      await postingDAL.popOneCachedGossipID(authorID);
    }
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService cacheGossipID()',
      false
    );
  }
};

//* caches the gossip by communicating with DAL layer
const cacheGossip = async (savedGossip) => {
  try {
    return await postingDAL.cacheGossip(
      String(savedGossip._id),
      JSON.stringify(savedGossip)
    );
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService cacheGossip()',
      false
    );
  }
};

//* saves the gossip & if image and link are there, then saves them as well
const saveGossip = async (gossipBody, gossipImg, uuid, clientDetails) => {
  //* log
  await publishers.logsPublisher('info', 'requested saveGossip service', {
    abstractionLevel: 'service',
    metaData: 'saveGossip',
    uuid,
    clientDetails,
  });
  try {
    //* storing sanitized text in gossipBody.gossip
    gossipBody.gossip = await badWordsFilter(
      gossipBody.gossip,
      uuid,
      clientDetails
    );

    //* checking whether the user provided an image
    if (gossipImg) {
      const imageData = await saveImage(gossipImg, uuid, clientDetails);
      gossipBody.post_img = imageData;
    }

    const savedGossip = await postingDAL.saveGossip(
      gossipBody,
      uuid,
      clientDetails
    );

    //* checking whether the user provided a link
    if (gossipBody.link) {
      await publishers.maliciousUrlDetection(
        {
          url: savedGossip.link,
          gossip_id: savedGossip._id,
          author_id: savedGossip.author_id,
          gossipData: savedGossip,
        },
        uuid,
        clientDetails
      );
    } else {
      await cacheGossipID(savedGossip.author_id, String(savedGossip._id));
      await cacheGossip(savedGossip);
    }
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    //* log
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'service',
      metaData: 'error in saveGossip',
      uuid,
      clientDetails,
    });
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService saveGossip()',
      false
    );
  }
};

//* deletes the gossip only after checking whether the provided authorID matches the actual gossip authorID
const deleteGossip = async (gossipID, authorID, uuid, clientDetails) => {
  //* log
  await publishers.logsPublisher('info', 'requested deleteGossip service', {
    abstractionLevel: 'service',
    metaData: 'deleteGossip',
    uuid,
    clientDetails,
  });
  try {
    const gossip = await postingDAL.gossip(gossipID, uuid, clientDetails);

    //* checks whether the provided authorID doesn't match the actual gossip authorID
    if (gossip.author_id !== authorID) {
      throw new ErrorHandler(
        500,
        'author of the gossip to be deleted not matching',
        'error in postingService deleteGossip()',
        false
      );
    }

    return await postingDAL.deleteGossip(gossipID, uuid, clientDetails);
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    //* log
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'service',
      metaData: 'error in deleteGossip',
      uuid,
      clientDetails,
    });
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService deleteGossip()',
      false
    );
  }
};

//* deletes an image by checking whether it is stored in imageKit or cloudinary then by communicating with the DAL layer
const deleteImage = async (imageDetails, uuid, clientDetails) => {
  //* log
  await publishers.logsPublisher('info', 'requested deleteImage service', {
    abstractionLevel: 'service',
    metaData: 'deleteImage',
    uuid,
    clientDetails,
  });
  try {
    if (imageDetails.service === 'imageKit') {
      return await postingDAL.deleteImage(
        imageDetails.fileId,
        uuid,
        clientDetails
      );
    }
    return await postingDAL.deleteBackupImage(
      imageDetails.fileId,
      uuid,
      clientDetails
    );
  } catch (err) {
    if (err instanceof ErrorHandler) {
      throw err;
    }
    //* log
    await publishers.logsPublisher('error', err, {
      abstractionLevel: 'service',
      metaData: 'error in deleteImage',
      uuid,
      clientDetails,
    });
    throw new ErrorHandler(
      500,
      err.message,
      'error in postingService deleteImage()',
      false
    );
  }
};

const postingService = {
  saveImage,
  saveGossip,
  load_model,
  deleteGossip,
  deleteImage,
  maliciousUrlDetection,
  cacheGossipID,
  cacheGossip,
};

module.exports = postingService;

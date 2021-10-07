const express = require('express');

// const morgan = require('morgan');
// const chalk = require('chalk');
// const fs = require('fs');
// const path = require('path');
// const { agent } = require('superagent');

const useragent = require('express-useragent');
const postingController = require('./postingController');
const validateSchema = require('./middleware/validateGossip');
const gossipSchema = require('./schema/gossipSchema');
const deleteGossipSchema = require('./schema/deleteGossipSchema');
const auth = require('./middleware/auth');
const upload = require('./middleware/multer');
const { errorHandlingMiddleware } = require('./postingErrors');
const rateLimiter = require('./middleware/rateLimiter');
const uuid = require('./middleware/uuid');

const router = new express.Router();

router.use(useragent.express());

router.use(rateLimiter);

//* router for receiving "posting" post request
router.post(
  '/posting',
  auth,
  upload.single('post_img'),
  validateSchema(gossipSchema),
  uuid,
  postingController.posting
);

//* router for receiving "delete Gossip" delete  request
router.delete(
  '/post',
  auth,
  validateSchema(deleteGossipSchema),
  uuid,
  postingController.deleteGossip
);

//* router for receiving "delete image" delete request
router.delete('/image', auth, uuid, postingController.deleteImage);

router.use(errorHandlingMiddleware);

// eslint-disable-next-line no-unused-vars
process.on('unhandledRejection', (error, p) => {
  console.log('=== UNHANDLED REJECTION ===');
  console.dir(error.stack);
});

module.exports = router;

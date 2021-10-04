const express = require('express');
const morgan = require('morgan');
const chalk = require('chalk');

const postingController = require('./postingController');
const validateSchema = require('./middleware/validateGossip');
const gossipSchema = require('./schema/gossipSchema');
const deleteGossipSchema = require('./schema/deleteGossipSchema');
const auth = require('./middleware/auth');
const upload = require('./middleware/multer');
const { errorHandlingMiddleware } = require('./postingErrors');
const rateLimiter = require('./middleware/rateLimiter');

const router = new express.Router();

router.use(
  morgan(
    chalk`{bgGreen.black HTTP Log} {yellowBright :remote-user [:date[clf]]} {blueBright :method :url HTTP/:http-version} {green :status} {magenta :res[content-length]} {cyan :referrer :user-agent}`
  )
);

router.use(rateLimiter);

router.post(
  '/posting',
  auth,
  upload.single('post_img'),
  validateSchema(gossipSchema),
  postingController.posting
);

router.delete(
  '/post',
  auth,
  validateSchema(deleteGossipSchema),
  postingController.deleteGossip
);

router.delete('/image', auth, postingController.deleteImage);

router.use(errorHandlingMiddleware);

// eslint-disable-next-line no-unused-vars
process.on('unhandledRejection', (error, p) => {
  console.log('=== UNHANDLED REJECTION ===');
  console.dir(error.stack);
});

module.exports = router;

const express = require('express');
const postingController = require('./postingController');
const validateGossip = require('./middleware/validateGossip');
const gossipSchema = require('./schema/gossipSchema');
const auth = require('./middleware/auth');
const upload = require('./middleware/multer');
const { errorHandlingMiddleware } = require('./postingErrors');

const router = new express.Router();

router.post(
  '/posting',
  auth,
  upload.single('post_img'),
  validateGossip(gossipSchema),
  postingController.posting
);

router.use(errorHandlingMiddleware);

// eslint-disable-next-line no-unused-vars
process.on('unhandledRejection', (error, p) => {
  console.log('=== UNHANDLED REJECTION ===');
  console.dir(error.stack);
});

module.exports = router;

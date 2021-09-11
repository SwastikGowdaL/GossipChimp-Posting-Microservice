const express = require('express');
const postingController = require('./postingController');
const validateGossip = require('./middleware/validateGossip');
const gossipSchema = require('./schema/gossipSchema');
const auth = require('./middleware/auth');
const upload = require('./middleware/multer');

const router = new express.Router();

router.post(
  '/posting',
  auth,
  upload.single('post_img'),
  validateGossip(gossipSchema),
  postingController.posting,
  (err, req, res, next) => {
    res.status(400).send({
      error: err.message,
    });
  }
);

module.exports = router;

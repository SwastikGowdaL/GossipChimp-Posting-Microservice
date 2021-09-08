const express = require('express');
const postingController = require('./postingController');
const validateGossip = require('./middleware/validateGossip');
const gossipSchema = require('./schema/gossipSchema');

const router = new express.Router();

router.get('/testing', postingController.testing);

router.post(
  '/posting',
  validateGossip(gossipSchema),
  postingController.posting
);

module.exports = router;

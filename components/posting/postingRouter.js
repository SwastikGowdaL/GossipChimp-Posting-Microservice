const express = require('express');
const postingController = require('./postingController');

const router = new express.Router();

router.get('/testing', postingController.testing);

router.post('/posting', postingController.posting);

module.exports = router;

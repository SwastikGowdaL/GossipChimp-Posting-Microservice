const express = require('express');

const router = new express.Router();

router.get('/posting', (req, res) => {
  res.status(200).send({
    status: 'Posting working',
  });
});

module.exports = router;

const postingService = require('./postingService');

exports.testing = (req, res) => {
  res.status(200).send({
    status: 'testing controller working',
  });
};

exports.posting = async (req, res) => {
  try {
    const gossipBody = JSON.parse(JSON.stringify(req.body));
    await postingService.saveGossip(gossipBody);
    res.status(201).send({
      status: 'success',
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

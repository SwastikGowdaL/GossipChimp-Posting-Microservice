const express = require('express');
const posting = require('./components/posting');

const app = express();
app.use(express.json());

app.use(posting);

app.get('/', (req, res) => {
  res.status(200).send({
    status: 'success',
  });
});

module.exports = app;

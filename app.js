const express = require('express');
const cors = require('cors');
require('./db/mongoose');
const posting = require('./components/posting');

const app = express();
app.use(express.json());
app.use(cors());

app.use(posting);

module.exports = app;

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('./db/mongoose');
const posting = require('./components/posting');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());

app.use(posting);

module.exports = app;

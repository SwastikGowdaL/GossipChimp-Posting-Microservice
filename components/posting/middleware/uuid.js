const ShortUniqueId = require('short-unique-id');

const uid = new ShortUniqueId({ length: 10 });

const uuid = (req, res, next) => {
  req.body.uuid = uid();
  next();
};

module.exports = uuid;

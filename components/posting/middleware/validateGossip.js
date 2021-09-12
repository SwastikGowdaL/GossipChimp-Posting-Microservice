const { ErrorHandler } = require('../postingErrors');

function validateGossip(gossipSchema) {
  return (req, res, next) => {
    const valid = gossipSchema(req.body);
    if (!valid) {
      const { errors } = gossipSchema;
      const err = new ErrorHandler(
        400,
        errors,
        'error in ajv middleware',
        true
      );
      next(err);
    }
    next();
  };
}

module.exports = validateGossip;

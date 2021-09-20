const { ErrorHandler } = require('../postingErrors');

function validateSchema(Schema) {
  return (req, res, next) => {
    const valid = Schema(req.body);
    if (!valid) {
      const { errors } = Schema;
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

module.exports = validateSchema;

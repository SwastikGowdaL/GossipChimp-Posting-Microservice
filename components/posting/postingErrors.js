class ErrorHandler extends Error {
  constructor(statusCode, message, reason, isOperational) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.reason = reason;
    this.isOperational = isOperational;
  }
}

const handleError = async (err, res) => {
  const { statusCode, message, isOperational } = err;
  if (isOperational) {
    res.status(statusCode).send({
      status: 'error',
      message,
    });
  } else {
    return res.status(statusCode).send({
      status: 'error',
      message,
    });
  }
};

const errorHandlingMiddleware = (err, req, res, next) => {
  if (err instanceof ErrorHandler) {
    handleError(err, res);
  } else {
    const errorHandlerObj = new ErrorHandler(
      400,
      err.message,
      'might be an error in the middleware / route Handler / error Handling Middleware ',
      false
    );
    handleError(errorHandlerObj, res);
  }
};

module.exports = {
  ErrorHandler,
  handleError,
  errorHandlingMiddleware,
};

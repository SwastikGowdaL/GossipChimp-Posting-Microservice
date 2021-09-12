const multer = require('multer');
const { ErrorHandler } = require('../postingErrors');

const upload = multer({
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
      return cb(
        new ErrorHandler(
          400,
          'Please provide a valid image file',
          'error in multer middleware',
          true
        )
        // new Error('Please provide a valid image file')
      );
    }
    cb(undefined, true);
  },
});

module.exports = upload;

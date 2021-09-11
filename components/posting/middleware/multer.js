const multer = require('multer');

const upload = multer({
  fileFilter(req, file, cb) {
    cb(undefined, true);
  },
});

module.exports = upload;

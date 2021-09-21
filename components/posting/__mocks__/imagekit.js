const config = require('../../../config/config');

class ImageKit {
  constructor(keys) {
    this.publicKey = keys.publicKey;
    this.privateKey = keys.privateKey;
    this.urlEndpoint = keys.urlEndpoint;
  }

  // eslint-disable-next-line class-methods-use-this
  upload(file, cb) {
    if (
      this.publicKey === config.IMAGE_KIT.publicKey &&
      this.privateKey === config.IMAGE_KIT.privateKey &&
      this.urlEndpoint === config.IMAGE_KIT.urlEndpoint
    ) {
      const result = {
        url: 'url',
      };
      cb(undefined, result);
    }

    const err = {
      status: 'Error',
      message: 'Invalid credentials',
    };
    cb(err, undefined);
  }

  deleteFile(imageID, cb) {
    if (
      this.publicKey === config.IMAGE_KIT.publicKey &&
      this.privateKey === config.IMAGE_KIT.privateKey &&
      this.urlEndpoint === config.IMAGE_KIT.urlEndpoint
    ) {
      const result = {
        fileId: 'fileId',
        url: 'url',
      };
      cb(undefined, result);
    }

    const err = {
      status: 'Error',
      message: 'Invalid credentials',
    };
    cb(err, undefined);
  }
}

module.exports = ImageKit;

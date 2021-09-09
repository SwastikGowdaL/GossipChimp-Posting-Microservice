class Error {
  constructor(message) {
    this.status = 'Error';
    this.message = message;
  }
}

module.exports = {
  Error,
};

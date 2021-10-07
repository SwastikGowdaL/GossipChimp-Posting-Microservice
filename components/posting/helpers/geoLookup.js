const geoip = require('geoip-lite');

const geoLookup = (ip1) => {
  //! dummy data provided need to be deleted in production
  const ip = '115.99.169.58';
  return geoip.lookup(ip);
};

module.exports = geoLookup;

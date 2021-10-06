const geoip = require('geoip-lite');

const geoLookup = (ip1) => {
  const ip = '115.99.169.58';
  return geoip.lookup(ip);
};

module.exports = geoLookup;

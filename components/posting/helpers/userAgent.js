const geoLookup = require('./geoLookup');

const finalUserAgentDetails = (userAgentsDetails, deviceUsed, ip) => ({
  device: deviceUsed,
  browser: userAgentsDetails.browser,
  version: userAgentsDetails.version,
  os: userAgentsDetails.os,
  platform: userAgentsDetails.platform,
  source: userAgentsDetails.source,
  ip,
  ipDetails: geoLookup(ip),
});

const userAgent = (userAgentsDetails, ip) => {
  if (userAgentsDetails.isMobile) {
    return finalUserAgentDetails(userAgentsDetails, 'isMobile', ip);
  }
  if (userAgentsDetails.isDesktop) {
    return finalUserAgentDetails(userAgentsDetails, 'isDesktop', ip);
  }
  if (userAgentsDetails.isBot) {
    return finalUserAgentDetails(userAgentsDetails, 'isBot', ip);
  }
};

module.exports = userAgent;

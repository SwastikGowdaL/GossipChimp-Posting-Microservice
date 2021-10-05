const finalUserAgentDetails = (userAgentsDetails, deviceUsed) => ({
  device: deviceUsed,
  browser: userAgentsDetails.browser,
  version: userAgentsDetails.version,
  os: userAgentsDetails.os,
  platform: userAgentsDetails.platform,
  source: userAgentsDetails.source,
});

const userAgent = (userAgentsDetails) => {
  if (userAgentsDetails.isMobile) {
    return finalUserAgentDetails(userAgentsDetails, 'isMobile');
  }
  if (userAgentsDetails.isDesktop) {
    return finalUserAgentDetails(userAgentsDetails, 'isDesktop');
  }
  if (userAgentsDetails.isBot) {
    return finalUserAgentDetails(userAgentsDetails, 'isBot');
  }
};

module.exports = userAgent;

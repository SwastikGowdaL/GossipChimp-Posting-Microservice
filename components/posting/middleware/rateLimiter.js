const rateLimit = require('express-rate-limit');
const ShortUniqueId = require('short-unique-id');
const publishers = require('../publishers');
const helpers = require('../helpers');

const uid = new ShortUniqueId({ length: 10 });

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many requests sent,so please try again after a minute',
  onLimitReached: (req, res, options) => {
    //* log
    publishers.logsPublisher('warn', 'rate limit reached', {
      abstractionLevel: 'middleware',
      metaData: 'rateLimit',
      uuid: uid(),
      clientDetails: helpers.userAgent(req.useragent, req.ip),
    });
  },
});

module.exports = limiter;

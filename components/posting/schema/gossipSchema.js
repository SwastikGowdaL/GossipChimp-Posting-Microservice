const ajvInstance = require('./ajvInstance');

const schema = {
  type: 'object',
  properties: {
    gossip: {
      type: 'string',
    },
    author_id: {
      type: 'string',
    },
    author_name: {
      type: 'string',
    },
    author_pic_id: {
      type: 'string',
    },
    author_authorized: {
      type: 'string',
      enum: ['false', 'true'],
    },
    pic_id: {
      type: 'string',
    },
    link: {
      type: 'string',
    },
    hashtags: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['gossip', 'author_id', 'author_name', 'author_pic_id', 'hashtags'],
  additionalProperties: false,
};

const validate = ajvInstance.compile(schema);
module.exports = validate;

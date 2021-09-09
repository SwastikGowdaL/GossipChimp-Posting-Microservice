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
      type: 'number',
      enum: [1, 0],
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

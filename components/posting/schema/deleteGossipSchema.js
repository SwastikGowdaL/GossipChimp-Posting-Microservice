const ajvInstance = require('./ajvInstance');

const schema = {
  type: 'object',
  properties: {
    gossip_id: {
      type: 'string',
    },
    author_id: {
      type: 'string',
    },
  },
  required: ['gossip_id', 'author_id'],
  additionalProperties: false,
};

const validate = ajvInstance.compile(schema);
module.exports = validate;

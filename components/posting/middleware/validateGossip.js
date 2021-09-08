function validateGossip(gossipSchema) {
  return (req, res, next) => {
    const valid = gossipSchema(req.body);
    if (!valid) {
      const { errors } = gossipSchema;
      return res.status(400).send(errors);
    }
    next();
  };
}

module.exports = validateGossip;

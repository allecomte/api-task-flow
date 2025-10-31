const Joi = require("joi");

const createOrUpdateTagSchema = Joi.object({
  name: Joi.string().required(),
});

module.exports = { createOrUpdateTagSchema };
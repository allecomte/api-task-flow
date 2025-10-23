const Joi = require('joi');
const mongoose = require('mongoose');


const  validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      // renvoyer une erreur 400 avec le message de Joi
      return res.status(400).json({ error: error.details[0].message });
    }
    req.body = value; // on peut remplacer body par les valeurs validées
    next();
  };
}

const checkIdFormat = Joi.string().custom((value, helpers) => {
  if (typeof value !== 'string') {
    return helpers.error('any.invalid');
  }
  
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'Id validation');

module.exports = {validateBody, checkIdFormat}
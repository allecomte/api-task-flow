const Joi = require("joi");
const mongoose = require("mongoose");
const getFiltersFromQuery = require("../utils/query.utils").getFiltersFromQuery;

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      // renvoyer une erreur 400 avec le message de Joi
      return res.status(400).json({ error: error.details[0].message });
    }
    req.body = value; // on remplace le body par les valeurs validées
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      // renvoyer une erreur 400 avec le message de Joi
      return res.status(400).json({ error: error.details[0].message });
    }
    req.query = value;
    getFiltersFromQuery(req, value);
    next();
  }
};

const validId = (...paramIds) => {
  return (req, res, next) => {
    const idsToCheck = paramIds.length ? paramIds : ['id'];
    for (const paramId of idsToCheck) {
      if (!mongoose.Types.ObjectId.isValid(req.params[paramId])) {
        return res.status(404).json({ message: "Resource not found" });
      }
    }
    next();
  };
};

const checkIdFormat = Joi.string().custom((value, helpers) => {
  if (typeof value !== "string") {
    return helpers.error("any.invalid");
  }

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "Id validation");

module.exports = { validateBody, validId, validateQuery, checkIdFormat };

const Joi = require('joi');
const Role = require('../enum/role.enum');

const registerUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(16).required(),
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    roles: Joi.array().items(Joi.string().valid(...Object.values(Role))).optional().default([Role.ROLE_USER])
});

const loginUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

module.exports = { registerUserSchema, loginUserSchema };
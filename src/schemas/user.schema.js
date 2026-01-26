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

const updateProfileSchema = Joi.object({
    firstname: Joi.string().optional(),
    lastname: Joi.string().optional(),
    email: Joi.string().email().optional()
});

const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(16).required()
});

module.exports = { registerUserSchema, loginUserSchema, updateProfileSchema, updatePasswordSchema };
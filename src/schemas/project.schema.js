const Joi = require('joi');
const {checkIdFormat} = require('../middleware/validation');
const paginationSchema = require('./pagination.schema');

const createProjectSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    startAt: Joi.date().required(),
    endAt: Joi.date().greater(Joi.ref('startAt')).optional(),
    members: Joi.array().items(checkIdFormat).optional().default([])
});

const updateProjectSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    startAt: Joi.date().optional(),
    endAt: Joi.date().greater(Joi.ref('startAt')).optional(),
});

const addMemberToProjectSchema = Joi.object({
    member: Joi.string().length(24).hex().required()
});

const projectQueryFilterSchema = paginationSchema.keys({
      sort: Joi.string().valid("startAt", "-startAt", "endtAt", "-endtAt", "createdAt", "-createdAt").optional().default("-createdAt"),
    isArchived: Joi.boolean().optional()
});

module.exports = {createProjectSchema, updateProjectSchema, addMemberToProjectSchema, projectQueryFilterSchema};
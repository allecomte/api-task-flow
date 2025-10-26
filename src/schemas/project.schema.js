const Joi = require('joi');
const {checkIdFormat} = require('../middleware/validation')

const createProjectSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    startAt: Joi.date().required(),
    endAt: Joi.date().greater(Joi.ref('startAt')).required(),
    members: Joi.array().items(checkIdFormat).optional().default([])
})

const updateProjectSchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    startAt: Joi.date().optional(),
    endAt: Joi.date().greater(Joi.ref('startAt')).optional(),
    members: Joi.array().items(checkIdFormat).optional()
})

const addMemberToProjectSchema = Joi.object({
    member: Joi.string().length(24).hex().required()
})

module.exports = {createProjectSchema: createProjectSchema, updateProjectSchema: updateProjectSchema, addMemberToProjectSchema: addMemberToProjectSchema}
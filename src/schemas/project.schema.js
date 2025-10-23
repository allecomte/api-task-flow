const Joi = require('joi');
const {checkIdFormat} = require('../middleware/validation')

const createProjectSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    startAt: Joi.date().required(),
    endAt: Joi.date().greater(Joi.ref('startAt')).required(),
    members: Joi.array().items(checkIdFormat).optional().default([])
})

module.exports = {createProjectSchema}
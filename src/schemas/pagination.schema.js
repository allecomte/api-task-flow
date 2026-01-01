const Joi = require('joi');

const paginationSchema = Joi.object({
    pagination: Joi.bool().optional().default(true),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),   
});

module.exports = paginationSchema;
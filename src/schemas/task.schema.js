const Joi = require("joi");
const { checkIdFormat } = require("../middleware/validation");
const Priority = require("../enum/priority.enum");

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  dueAt: Joi.date().required(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .required(),
  assignees: Joi.array().items(checkIdFormat).optional().default([]),
  project: checkIdFormat.required(),
  tags: Joi.array().items(checkIdFormat).optional().default([]),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  dueAt: Joi.date().optional(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .optional(),
  assignees: Joi.array().items(checkIdFormat).optional(),
  tags: Joi.array().items(checkIdFormat).optional(),
});

module.exports = {createTaskSchema, updateTaskSchema};
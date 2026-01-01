const Joi = require("joi");
const { checkIdFormat } = require("../middleware/validation");
const Priority = require("../enum/priority.enum");
const State = require("../enum/state.enum");
const paginationSchema = require('./pagination.schema');

const createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  dueAt: Joi.date().required(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .required(),
  state: Joi.string()
    .valid(...Object.values(State))
    .optional(),
  assignee: checkIdFormat.required(),
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
  state: Joi.string()
    .valid(...Object.values(State))
    .optional(),
  assignee: checkIdFormat.optional(),
  tags: Joi.array().items(checkIdFormat).optional(),
});

const taskQueryFilterSchema = paginationSchema.keys({
  state: Joi.string()
    .valid(...Object.values(State))
    .optional(),
  priority: Joi.string()
    .valid(...Object.values(Priority))
    .optional(),
  dueAt: Joi.date().optional(),
  tag: checkIdFormat.optional(),
  assignee: checkIdFormat.optional(),
  sort: Joi.string().valid("dueAt", "-dueAt", "priority", "-priority").optional().default("-priority"),
  notClosed: Joi.bool().optional().default(true),
});

module.exports = { createTaskSchema, updateTaskSchema, taskQueryFilterSchema };

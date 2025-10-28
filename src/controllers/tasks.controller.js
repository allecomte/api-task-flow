const { default: mongoose } = require("mongoose");
const Task = require("../models/task.model");
const { allExistByIds, existsById } = require("../utils/dbCheck.utils");

exports.createTask = async (req, res) => {};

exports.getTasks = async (req, res) => {};

exports.getTaskById = async (req, res) => {};

exports.updateTask = async (req, res, next) => {};

exports.deleteTask = async (req, res, next) => {};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
};

const { default: mongoose } = require("mongoose");
const Task = require("../models/task.model");
const { allExistByIds, existsById } = require("../utils/dbCheck.utils");

exports.createTag = async (req, res) => {};

exports.getTags = async (req, res) => {};

exports.getTagById = async (req, res) => {};

exports.updateTag = async (req, res, next) => {};

exports.deleteTag = async (req, res, next) => {};

module.exports = {
    createTag,
    getTags,
    getTagById,
    updateTag,
    deleteTag
}
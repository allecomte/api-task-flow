const { default: mongoose } = require("mongoose");
const { allExistByIds, existsById } = require("../utils/dbCheck.utils");
// Models
const Task = require("../models/task.model");
const Project = require("../models/project.model");
const User = require("../models/user.model");
const Tag = require("../models/tag.model");

exports.createTask = async (req, res) => {
  try {
    const { project, assignee, tags, dueAt } = req.body;
    const projectAssociated = await Task.findById(project);
    if (!projectAssociated) {
      return res.status(400).json({ error: "Project does not exist" });
    }
    if (projectAssociated.owner.toString() !== req.user.id) {
      return res.status(403).json({
        error:
          "Not authorized to add tasks to this project, only project's owner can do this action",
      });
    }
    const assigneeExists = assignee ? await existsById(User, assignee) : true;
    if (!assigneeExists) {
      return res.status(400).json({ error: "Assignee does not exist" });
    }
    const tagsExist = tags ? await allExistByIds(Tag, tags) : true;
    if (!tagsExist) {
      return res
        .status(400)
        .json({ error: "One or several tags do not exist" });
    }
    if (projectAssociated.startAt > dueAt || projectAssociated.endAt < dueAt) {
      return res.status(400).json({
        error: "Task due date must be within the project's start and end dates",
      });
    }
    const task = new Task({
      ...req.body,
    });
    res.status(201).json(await task.save());
  } catch (error) {
    console.log("Error POST /tasks :", error);
    return res.status(500).json({ error });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.roles.includes(Role.ROLE_USER)) {
      filter = { assignee: req.user.id };
    }
    const tasks = await Task.find(filter).sort({
      createdAt: -1,
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.log("Error GET /tasks :", error);
    return res.status(500).json({ error });
  }
};

exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    res.status(200).json(req.task);
  } catch (error) {
    console.log(`Error GET /tasks/${id} :`, error);
    return res.status(500).json({ error });
  }
};

exports.updateTask = async (req, res, next) => {
  const { id } = req.params;
  try {
    const task = req.task;
    const { title, description, dueAt, assignee, tags, priority, state } = req.body;
    if(task.project.owner.toString() !== req.user.id && title !== undefined && description !== undefined && dueAt !== undefined && assignee !== undefined && tags !== undefined && priority !== undefined){
      return res.status(403).json({error: "Only project owner can update all task fields"});
    }
    if(assignee !== undefined){
      const assigneeExists = assignee ? await existsById(User, assignee) : true;
      if (!assigneeExists) {
        return res.status(400).json({ error: "Assignee does not exist" });
      }
    }
    if(tags !== undefined){
      const tagsExist = tags ? await allExistByIds(Tag, tags) : true;
      if (!tagsExist) {
        return res
          .status(400)
          .json({ error: "One or several tags do not exist" });
      }
    }
    Object.assign(task, {
      ...(title && { title }),
      ...(description && { description }),
      ...(dueAt && { dueAt }),
      ...(assignee && { assignee }),
      ...(tags && { tags }),
      ...(priority && { priority }),
      ...(state && { state }),
    });
    res.status(200).json(await task.save());
  } catch (error) {
    console.log(`Error PATCH /tasks/${id} :`, error);
    return res.status(500).json({ error });
  }
};

exports.deleteTask = async (req, res, next) => {
  const { id } = req.params;
  try {
    await req.task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(`Error DELETE /tasks/${id} :`, error);
    return res.status(500).json({ error });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};

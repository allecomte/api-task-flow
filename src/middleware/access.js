const { default: mongoose } = require("mongoose");
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const Tag = require("../models/tag.model");
const { canAccessProject, canAccessTask } = require("../utils/access.utils");

const getProjectWithAccess = (strategy, fields = null) => {
  return async (req, res, next) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id, fields);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      canAccessProject(req.user, project, strategy);
      req.project = project;
      next();
    } catch (error) {
      if (error.message === "Not authorized")
        return res.status(403).json({ message: error.message });
      return res.status(500).json({ error });
    }
  };
};

const getTaskWithAccess = (strategy, fields = null) => {
  return async (req, res, next) => {
    const { id } = req.params;
    try {
      const task = await Task.findById(id, fields);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      const project = await Project.findById(task.project);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      canAccessTask(req.user, task, project, strategy);
      req.task = task;
      req.project = project;
      next();
    } catch (error) {
      if (error.message === "Not authorized")
        return res.status(403).json({ message: error.message });
      return res.status(500).json({ error });
    }
  };
};

const getTagWithAccess = (strategy, fields = null) => {
  return async (req, res, next) => {
    const { id } = req.params;
    try {
      const tag = await Tag.findById(id, fields);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }
      const project = await Project.findById(tag.project);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      req.tag = tag;
      next();
    } catch (error) {
      if (error.message === "Not authorized")
        return res.status(403).json({ message: error.message });
      return res.status(500).json({ error });
    }
  };
};

module.exports = { getProjectWithAccess, getTaskWithAccess };

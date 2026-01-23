const { default: mongoose } = require("mongoose");
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const Tag = require("../models/tag.model");
const {
  canAccessProject,
  canAccessTask,
  canAccessTag,
} = require("../utils/access.utils");
const { query } = require("express-validator");

function createAccessMiddleware({ Project, Task, Tag }) {
  const getProjectWithAccess = (strategy, fields = null) => {
    return async (req, res, next) => {
      const { id } = req.params;
      try {
        let query = Project.findById(id, fields);
        if (fields === null) {
          query = query
            .populate("members", "firstname lastname email")
            .populate("owner", "firstname lastname email")
            .populate({
              path: "tasks",
              select: "title state priority dueAt assignee",
              populate: {
                path: "assignee",
                select: "firstname lastname email",
              },
            })
            .populate("tags", "name");
        }
        const project = await query;
        if (!project) {
          return res.status(404).json({ message: "Project not found" });
        }
        canAccessProject(req.user, project, strategy);
        req.project = project;
        next();
      } catch (error) {
        console.log(error);
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
        const task = await Task.findById(id, fields)
        .populate("project", "title description startAt")
        .populate("assignee", "firstname lastname email")
        .populate("tags", "name");
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
      const { id, projectId } = req.params;
      try {
        let project = null;
        if (projectId) {
          project = await Project.findById(projectId);
          if (!project) {
            return res.status(404).json({ message: "Project not found" });
          }
        } else if (id) {
          const tag = await Tag.findById(id, fields);
          if (!tag) {
            return res.status(404).json({ message: "Tag not found" });
          }
          project = await Project.findById(tag.project);
          if (!project) {
            return res.status(404).json({ message: "Project not found" });
          }
          req.tag = tag;
        }
        if (project) {
          canAccessTag(req.user, project, strategy);
          req.project = project;
        }
        next();
      } catch (error) {
        if (error.message === "Not authorized")
          return res.status(403).json({ message: error.message });
        return res.status(500).json({ error });
      }
    };
  };

  return { getProjectWithAccess, getTaskWithAccess, getTagWithAccess };
}

module.exports = { createAccessMiddleware };

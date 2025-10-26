const { default: mongoose } = require("mongoose");
const Project = require('../models/project.model');
const { canAccessProject } = require('../utils/access.utils');

const getProjectWithAccess = (strategy, fields = null) => {
  return async (req, res, next) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id, fields);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      canAccessProject(req.user,project,strategy,res);
      req.project = project;
      next();
    } catch (error) {
      if (error.message === "Not authorized") return res.status(403).json({ message: error.message });
      return res.status(500).json({ error });
    }
  };
};

module.exports = { getProjectWithAccess };
const { default: mongoose } = require("mongoose");
const Project = require("../models/project.model");
const User = require("../models/user.model");
const { allExistByIds } = require("../utils/dbCheck.utils");

exports.createProject = async (req, res) => {
  try {
    const { members } = req.body;
    const allMembersExist = await allExistByIds(User, members);

    if (!allMembersExist) {
      return res
        .status(400)
        .json({ error: "One or several members do not exist" });
    }

    const project = new Project({
      ...req.body,
      owner: req.user.id,
    });

    console.log("Creating project :", project);
    res.status(201).json(await project.save());
  } catch (error) {
    console.log("Erreur dans POST /projects :", error);
    return res.status(500).json({ error });
  }
};

exports.getProjects = async (req, res) => {
    
  console.log("Fetching all projects");
  res.status(200).json({ message: "ok" });
};

exports.getProjectById = async (req, res) => {
  console.log("Fetching project with ID:", req.params.id);
  res.status(200).json({ message: "ok" });
};

exports.updateProject = async (req, res, next) => {};

exports.deleteProject = async (req, res, next) => {};

exports.addOneMemberToOneProject = async (req, res, next) => {};

exports.deleteOneMemberFromOneProject = async (req, res, next) => {};

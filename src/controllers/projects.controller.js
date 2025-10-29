const { default: mongoose } = require("mongoose");
const { allExistByIds, existsById } = require("../utils/dbCheck.utils");
// Models
const Project = require("../models/project.model");
const User = require("../models/user.model");
const Role = require("../enum/role.enum");
const Task = require("../enum/task.enum");

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

    res.status(201).json(await project.save());
  } catch (error) {
    console.log("Error POST /projects :", error);
    return res.status(500).json({ error });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let filter = {};
    if (req.user.roles.includes(Role.ROLE_USER)) {
      filter = { members: req.user.id };
    }
    const projects = await Project.find(
      filter,
      "title description startAt endAt"
    ).sort({
      createdAt: -1,
    });
    res.status(200).json(projects);
  } catch (error) {
    console.log("Error GET /projects :", error);
    return res.status(500).json({ error });
  }
};

exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    res.status(200).json(req.project);
  } catch (error) {
    console.log(`Error GET /projects/${id} :`, error);
    return res.status(500).json({ error });
  }
};

exports.updateProject = async (req, res, next) => {
  const { id } = req.params;
  try {
    const project = req.project;
    const { title, description, startAt, endAt, members } = req.body;
    if(members !== undefined){
      const allMembersExist = await allExistByIds(User, members);
    if (!allMembersExist) {
      return res
        .status(400)
        .json({ error: "One or several members do not exist" });
    }
    }
    Object.assign(project, {
      ...(title && { title }),
      ...(description && { description }),
      ...(startAt && { startAt }),
      ...(endAt && { endAt }),
      ...(members && { members }),
    });
    res.status(200).json(await project.save());
  } catch (error) {
    console.log(`Error PATCH /projects/${id} :`, error);
    return res.status(500).json({ error });
  }
};

exports.deleteProject = async (req, res, next) => {
  const { id } = req.params;
  try {
    const project = req.project;
    // Don't delete project if it has tasks
    const tasksCount = await Task.countDocuments({ project: project._id });
    if (tasksCount > 0) {
      return res .status(400).json({ error: "Cannot delete project with existing tasks" });
    }
    await project.deleteOne();
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    console.log(`Error DELETE /projects/${id} :`, error);
    return res.status(500).json({ error });
  }
};

exports.addOneMemberToOneProject = async (req, res, next) => {
  const { id } = req.params;
  try {
    const project = req.project;
    const isUserExists = await existsById(User, req.body.member);
    if (!isUserExists) {
      return res
        .status(400)
        .json({ error: "User to be added in members does not exist" });
    }
    if (!project.members.map(String).includes(req.body.member)) {
      project.members.push(req.body.member);
    } else {
      return res
        .status(400)
        .json({ error: "User is already a member of the project" });
    }
    res.status(200).json(await project.save());
  } catch (error) {
    console.log(`Error DELETE /projects/${id} :`, error);
    return res.status(500).json({ error });
  }
};

exports.deleteOneMemberFromOneProject = async (req, res, next) => {
  const { id, userId } = req.params;
  try {
    const project = req.project;
    const isUserExists = await existsById(User, userId);
    if (!isUserExists) {
      return res
        .status(400)
        .json({ error: "User to be deleted in members does not exist" });
    }
    if (!project.members.map(String).includes(userId)) {
      return res
        .status(400)
        .json({ error: "User is not a member of the project" });
    }
    project.members = project.members.filter((member) => member.toString() !== userId);
    res.status(200).json(await project.save());
  } catch (error) {
    console.log(`Error DELETE /projects/${id}/members/${userId} :`, error);
    return res.status(500).json({ error });
  }
};
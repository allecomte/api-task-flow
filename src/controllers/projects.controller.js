const { default: mongoose } = require("mongoose");
const { allExistByIds, existsById } = require("../utils/dbCheck.utils");
// Models
const Project = require("../models/project.model");
const User = require("../models/user.model");
const Task = require("../models/task.model");
// Enums
const Role = require("../enum/role.enum");
// Services
const {
  addOneProjectToUserMembership,
  addOneProjectToUserOwnership,
  removeOneProjectFromUserMembership,
} = require("../services/user.service");

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
    const projectCreated = await project.save();
    // Add project to owner's list of projects
    await addOneProjectToUserOwnership(req.user.id, projectCreated._id);
    // Add project to each member's list of projects
    for (const memberId of members) {
      await addOneProjectToUserMembership(memberId, projectCreated._id);
    }

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
      "title description startAt endAt tasks"
    )
      .populate({
        path: "my_tasks",
        match: { assignee: req.user.id },
        select: "_id state",
        options: { strictPopulate: false },
      })
      .sort({
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
    const { title, description, startAt, endAt } = req.body;
    Object.assign(project, {
      ...(title && { title }),
      ...(description && { description }),
      ...(startAt && { startAt }),
      ...(endAt && { endAt }),
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
      return res
        .status(400)
        .json({ error: "Cannot delete project with existing tasks" });
    }
    const ownerId = project.owner;
    const memberIds = project.members;
    await project.deleteOne();
    // Remove project from owner's list of projects
    await removeOneProjectFromUserMembership(ownerId, id);
    // Remove project from each member's list of projects
    for (const memberId of memberIds) {
      await removeOneProjectFromUserMembership(memberId, id);
    }
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
    const member = req.body.member;
    const isUserExists = await existsById(User, member);
    if (!isUserExists) {
      return res
        .status(400)
        .json({ error: "User to be added in members does not exist" });
    }
    if (!project.members.map(String).includes(member)) {
      project.members.push(member);
    } else {
      return res
        .status(400)
        .json({ error: "User is already a member of the project" });
    }
    await addOneProjectToUserMembership(member, project._id);
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
    // Check if the member is assigned to a task in the project
    const assignedTasksCount = await Task.countDocuments({
      project: project._id,
      assignee: userId,
    });
    if (assignedTasksCount > 0) {
      return res
        .status(400)
        .json({
          error: "Cannot remove member assigned to tasks in the project",
        });
    }
    await removeOneProjectFromUserMembership(userId, project._id);
    project.members = project.members.filter(
      (member) => member.toString() !== userId
    );
    res.status(200).json(await project.save());
  } catch (error) {
    console.log(`Error DELETE /projects/${id}/members/${userId} :`, error);
    return res.status(500).json({ error });
  }
};

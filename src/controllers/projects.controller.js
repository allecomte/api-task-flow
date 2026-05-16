const { default: mongoose } = require("mongoose");
const { allExistByIds, existsById } = require("../utils/dbCheck.utils");
const { getPaginationInfo } = require("../utils/pagination.utils");
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
        .json({ error: "Un ou plusieurs membres associés à ce projet n'existent pas" });
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
    return res.status(500).json({ error: "Une erreur est survenue lors de la création du projet" });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let filters = {};
    if (req.user.roles.includes(Role.ROLE_USER)) {
      filters = { members: req.user.id };
    }
    filters = { ...filters, ...req.filters };
    const hasPagination = filters.pagination;
    delete filters.pagination;

    let projectQuery = Project.find(
        filters,
        "title description startAt endAt tasks members"
      )
      .sort(req.sort)
      .populate({
        path: "myTasks",
        match: { assignee: req.user.id },
        select: "_id title state priority dueAt",
        options: { strictPopulate: false },
      });

      if (hasPagination) {
        projectQuery = projectQuery
        .skip(req.pagination.skip)
        .limit(req.pagination.limit);
      }

      const projects = await projectQuery;
      const paginationInfo = await getPaginationInfo(
        Project,
        hasPagination ? req.pagination : { page: 1, limit: projects.length },
        filters
      );

      res.status(200).json({ data: projects, pagination: paginationInfo });
  } catch (error) {
    console.log("Error GET /projects :", error);
    return res.status(500).json({ error: "Une erreur est survenue lors de la récupération des projets" });
  }
};

exports.getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    res.status(200).json(req.project);
  } catch (error) {
    console.log(`Error GET /projects/${id} :`, error);
    return res.status(500).json({ error: "Une erreur est survenue lors de la récupération du projet" });
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
    return res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour du projet" });
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
        .json({ error: "Impossible de supprimer un projet avec des tâches existantes" });
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
    return res.status(500).json({ error: "Une erreur est survenue lors de la suppression du projet" });
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
        .json({ error: "L'utilisateur à ajouter dans les membres n'existe pas" });
    }
    const memberIds = project.members.map(m => String(m._id));
    if (!memberIds.includes(member)) {
      project.members.push(member);
    } else {
      return res
        .status(400)
        .json({ error: "L'utilisateur est déjà membre du projet" });
    }
    await addOneProjectToUserMembership(member, project._id);
    res.status(200).json(await project.save());
  } catch (error) {
    console.log(`Error POST /projects/${id}/members :`, error);
    return res.status(500).json({ error: "Une erreur est survenue lors de l'ajout d'un membre au projet" });
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
        .json({ error: "L'utilisateur à supprimer des membres n'existe pas" });
    }
    const memberIds = project.members.map(member => String(member._id));
    if (!memberIds.map(String).includes(userId)) {
      return res
        .status(400)
        .json({ error: "L'utilisateur n'est pas membre du projet" });
    }
    // Check if the member is assigned to a task in the project
    const assignedTasksCount = await Task.countDocuments({
      project: project._id,
      assignee: userId,
    });
    if (assignedTasksCount > 0) {
      return res.status(400).json({
        error: "Impossible de supprimer un membre assigné à des tâches dans le projet",
      });
    }
    await removeOneProjectFromUserMembership(userId, project._id);
    project.members = project.members.filter(
      (member) => (member._id ? member._id.toString() : member.toString()) !== userId
    );
    res.status(200).json(await project.save());
  } catch (error) {
    console.log(`Error DELETE /projects/${id}/members/${userId} :`, error);
    return res.status(500).json({ error: "Une erreur est survenue lors de la suppression du membre du projet" });
  }
};

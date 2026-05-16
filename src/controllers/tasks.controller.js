const { default: mongoose } = require("mongoose");
const { allExistByIds, existsById } = require("../utils/dbCheck.utils");
const { getPaginationInfo } = require("../utils/pagination.utils");
// Models
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const Tag = require("../models/tag.model");
// Enums
const Role = require("../enum/role.enum");
// Services
const {
  addOneTaskToUser,
  removeOneTaskFromUser,
} = require("../services/user.service");
const State = require("../enum/state.enum");

exports.createTask = async (req, res) => {
  try {
    const { project, assignee, tags, dueAt } = req.body;
    const projectAssociated = await Project.findById(project);
    if (!projectAssociated) {
      return res.status(400).json({ error: "Le projet associé à cette tâche n'existe pas" });
    }
    if (projectAssociated.owner.toString() !== req.user.id) {
      return res.status(403).json({
        error:
          "Non autorisé à ajouter des tâches à ce projet. Seul le propriétaire du projet peut effectuer cette action",
      });
    }
    const assigneeExists = assignee ? await existsById(User, assignee) : true;
    if (!assigneeExists) {
      return res.status(400).json({ error: "L'utilisateur assigné n'existe pas" });
    }
    if (
      assignee !== undefined &&
      !projectAssociated.members.map(String).includes(assignee)
    ) {
      return res
        .status(400)
        .json({ error: "L'utilisateur assigné n'est pas membre du projet associé à cette tâche" });
    }
    const tagsExist = tags ? await allExistByIds(Tag, tags) : true;
    if (!tagsExist) {
      return res
        .status(400)
        .json({ error: "Un ou plusieurs tags n'existent pas" });
    }
    if (
      projectAssociated.startAt > dueAt ||
      (projectAssociated.endAt !== null && projectAssociated.endAt < dueAt)
    ) {
      return res.status(400).json({
        error: "La date d'échéance de la tâche doit être comprise entre les dates de début et de fin du projet",
      });
    }
    const task = new Task({
      ...req.body,
    });
    const taskCreated = await task.save();
    projectAssociated.tasks.push(taskCreated._id);
    if (assignee) {
      await addOneTaskToUser(assignee, taskCreated._id);
    }
    await projectAssociated.save();

    const taskPopulated = await Task.findById(taskCreated._id)
      .populate("project", "title description startAt endAt")
      .populate("assignee", "firstname lastname email");

    res.status(201).json(taskPopulated);

    // res.status(201).json(taskCreated);
  } catch (error) {
    console.log("Error POST /tasks :", error);
    return res.status(500).json({ error: "Une erreur est survenue lors de la création de la tâche" });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let filters = {};
    if (req.user.roles.includes(Role.ROLE_USER)) {
      filters = { assignee: req.user.id };
    }
    filters = { ...filters, ...req.filters };
    if (filters.notClosed && filters.state === undefined) {
      filters.state = { $ne: State.CLOSED };
    }
    if (filters.onlyMine !== undefined && filters.onlyMine && filters.assignee === undefined) {
      filters.assignee = req.user.id;
    }

    delete filters.notClosed;
    delete filters.onlyMine;
    const hasPagination = filters.pagination;
    delete filters.pagination;
    let taskQuery = Task.find(filters)
      .sort(req.sort)
      .populate("assignee", "firstname lastname email");
    if (hasPagination) {
      taskQuery = taskQuery
        .skip(req.pagination.skip)
        .limit(req.pagination.limit);
    }
    const tasks = await taskQuery;
    const paginatioInfo = await getPaginationInfo(
      Task,
      hasPagination ? req.pagination : { page: 1, limit: tasks.length },
      filters,
    );
    res.status(200).json({ data: tasks, pagination: paginatioInfo });
  } catch (error) {
    console.log("Error GET /tasks :", error);
    return res.status(500).json({ error: "Une erreur est survenue lors de la récupération des tâches" });
  }
};

exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    res.status(200).json(req.task);
  } catch (error) {
    console.log(`Error GET /tasks/${id} :`, error);
    return res.status(500).json({ error: "Une erreur est survenue lors de la récupération de la tâche" });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = req.task;
    const { title, description, dueAt, assignee, tags, priority, state } =
      req.body;
    if (
      req.project.owner.toString() !== req.user.id &&
      (title !== undefined ||
        description !== undefined ||
        dueAt !== undefined ||
        assignee !== undefined ||
        tags !== undefined ||
        priority !== undefined)
    ) {
      return res.status(403).json({
        error:
          "Seul le propriétaire du projet peut mettre à jour ces champs: title, description, due date, assignee, tags, priority",
      });
    }
    if (assignee !== undefined) {
      const assigneeExists = assignee ? await existsById(User, assignee) : true;
      if (!assigneeExists) {
        return res.status(400).json({ error: "L'utilisateur assigné n'existe pas" });
      }
      if (!req.project.members.map(String).includes(assignee)) {
        return res
          .status(400)
          .json({ error: "L'utilisateur assigné n'est pas membre du projet associé à cette tâche" });
      }
      if (task.assignee && task.assignee.toString() !== assignee) {
        // Remove task from previous assignee
        removeOneTaskFromUser(task.assignee, id);
        // Add task to new assignee
        addOneTaskToUser(assignee, id);
      } else if (!task.assignee) {
        // Add task to new assignee
        addOneTaskToUser(assignee, id);
      }
    }
    if (tags !== undefined) {
      const tagsExist = tags ? await allExistByIds(Tag, tags) : true;
      if (!tagsExist) {
        return res
          .status(400)
          .json({ error: "Un ou plusieurs tags n'existent pas" });
      }
    }
    if (
      dueAt !== undefined &&
      (req.project.startAt > dueAt ||
        (req.project.endAt !== null && req.project.endAt < dueAt))
    ) {
      return res.status(400).json({
        error: "La date d'échéance de la tâche doit être comprise entre les dates de début et de fin du projet",
      });
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
    const updatedTask = await task.save();

    await updatedTask.populate({ path: "assignee", select: "firstname lastname email" });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.log(`Error PATCH /tasks/${id} :`, error);
    return res.status(500).json({ error: "Une erreur est survenue lors de la mise à jour de la tâche" });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const task = req.task;
    const project = req.project;
    await removeOneTaskFromUser(task.assignee, id);
    await req.task.deleteOne();
    project.tasks = project.tasks.filter((taskId) => taskId.toString() !== id);
    await project.save();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(`Error DELETE /tasks/${id} :`, error);
    return res.status(500).json({ error: "Une erreur est survenue lors de la suppression de la tâche" });
  }
};

exports.associateOrDissociateTagToTask = async (req, res) => {
  const { id, tagId } = req.params;
  try {
    const task = req.task;
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    const tagAlreadyAssociated = task.tags.some(tag => tag.id === tagId);
    if (tagAlreadyAssociated) {
      // Dissociate tag
      await Task.findByIdAndUpdate(id, { $pull: { tags: tagId } });
      await Tag.findByIdAndUpdate(tag._id, { $pull: { tasks: id } });
    } else {
      // Associate tag
      await Task.findByIdAndUpdate(id, { $addToSet: { tags: tagId } });
      await Tag.findByIdAndUpdate(tag._id, { $addToSet: { tasks: id } });
    }
    return res.status(200).json({
      message: tagAlreadyAssociated
        ? "Tag dissociated from task successfully"
        : "Tag associated to task successfully",
    });
  } catch (error) {
    console.log(`Error POST /tasks/${id}/tags/${tagId} :`, error);
    return res.status(500).json({ error: "Une erreur est survenue lors de l'association ou de la dissociation du tag à la tâche" });
  }
};

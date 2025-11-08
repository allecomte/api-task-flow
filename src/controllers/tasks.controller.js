const { default: mongoose } = require("mongoose");
const { allExistByIds, existsById } = require("../utils/dbCheck.utils");
const {getPaginationInfo} = require("../utils/pagination.utils");
// Models
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const Tag = require("../models/tag.model");
// Enums
const Role = require("../enum/role.enum");
// Services
const { addOneTaskToUser, removeOneTaskFromUser } = require("../services/user.service");

exports.createTask = async (req, res) => {
  try {
    const { project, assignee, tags, dueAt } = req.body;
    const projectAssociated = await Project.findById(project);
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
    if (assignee !== undefined && !projectAssociated.members.map(String).includes(assignee)) {
      return res
        .status(400)
        .json({ error: "Assignee is not a member of the task's project" });
    }
    const tagsExist = tags ? await allExistByIds(Tag, tags) : true;
    if (!tagsExist) {
      return res
        .status(400)
        .json({ error: "One or several tags do not exist" });
    }
    if (projectAssociated.startAt > dueAt || (projectAssociated.endAt !== null && projectAssociated.endAt < dueAt)) {
      return res.status(400).json({
        error: "Task due date must be within the project's start and end dates",
      });
    }
    const task = new Task({
      ...req.body,
    });
    const taskCreated = await task.save();
    projectAssociated.tasks.push(taskCreated._id);
    if(assignee) {
      await addOneTaskToUser(assignee, taskCreated._id);
    }
    await projectAssociated.save();
    res.status(201).json(taskCreated);
  } catch (error) {
    console.log("Error POST /tasks :", error);
    return res.status(500).json({ error });
  }
};

exports.getTasks = async (req, res) => {
  try {
    let filters = {};
    if (req.user.roles.includes(Role.ROLE_USER)) {
      filters = { assignee: req.user.id };
    }
    filters = { ...filters, ...req.filters };
    console.log('filters', filters)
    const tasks = await Task.find(filters)
      .sort(req.sort)
      .skip(req.pagination.skip)
      .limit(req.pagination.limit);
    const paginatioInfo = await getPaginationInfo(Task, req.pagination);
    console.log('data',tasks)
    res.status(200).json({data: tasks, pagination: paginatioInfo});
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
      return res
        .status(403)
        .json({
          error:
            "Only project owner can update these fields: title, description, due date, assignee, tags, priority",
        });
    }
    if (assignee !== undefined) {
      const assigneeExists = assignee ? await existsById(User, assignee) : true;
      if (!assigneeExists) {
        return res.status(400).json({ error: "Assignee does not exist" });
      }
      if (!req.project.members.map(String).includes(assignee)) {
        return res
          .status(400)
          .json({ error: "Assignee is not a member of the task's project" });
      }
      if(task.assignee && task.assignee.toString() !== assignee){
        // Remove task from previous assignee
        removeOneTaskFromUser(task.assignee, id);
        // Add task to new assignee
        addOneTaskToUser(assignee, id);
      }else if (!task.assignee){
        // Add task to new assignee
        addOneTaskToUser(assignee, id);
      }
    }
    if (tags !== undefined) {
      const tagsExist = tags ? await allExistByIds(Tag, tags) : true;
      if (!tagsExist) {
        return res
          .status(400)
          .json({ error: "One or several tags do not exist" });
      }
    }
    if (
      dueAt !== undefined &&
      (req.project.startAt > dueAt || (req.project.endAt !== null && req.project.endAt < dueAt))
    ) {
      return res.status(400).json({
        error: "Task due date must be within the project's start and end dates",
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
    res.status(200).json(await task.save());
  } catch (error) {
    console.log(`Error PATCH /tasks/${id} :`, error);
    return res.status(500).json({ error });
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
    return res.status(500).json({ error });
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
    const tagAlreadyAssociated = task.tags.map(String).includes(tagId);
    if (tagAlreadyAssociated) {
      // Dissociate tag
      await Task.findByIdAndUpdate(id, { $pull: { tags: tagId } });
      await Tag.findByIdAndUpdate(tag._id, { $pull: { tasks: id } });
    } else {
      // Associate tag
      await Task.findByIdAndUpdate(id, { $addToSet: { tags: tagId } });
      await Tag.findByIdAndUpdate(tag._id, { $addToSet: { tasks: id } });
    }
    return res
      .status(200)
      .json({
        message: tagAlreadyAssociated
          ? "Tag dissociated from task successfully"
          : "Tag associated to task successfully",
      });
  } catch (error) {
    console.log(`Error POST /tasks/${id}/tags/${tagId} :`, error);
    return res.status(500).json({ error });
  }
};

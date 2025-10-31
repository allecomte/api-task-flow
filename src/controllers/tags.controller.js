const { default: mongoose } = require("mongoose");
const { allExistByIds, existsById } = require("../utils/dbCheck.utils");
// Models
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const Tag = require("../models/tag.model");

exports.createTag = async (req, res) => {
  const project = req.project;
  try {
    const { name } = req.body;
    const tag = new Tag({
      name,
      project: project.id,
    });
    res.status(201).json(await tag.save());
  } catch (error) {
    console.log(`Error POST /projects/${project.id}/tags :`, error);
    return res.status(500).json({ error });
  }
};

exports.getTagsByProject = async (req, res) => {
  const project = req.project;
  try{
    const tags = await Tag.find({ project: project.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(tags);
  } catch (error) {
    console.log(`Error GET /projects/${project.id}/tags :`, error);
    return res.status(500).json({ error });
  }
};

exports.updateTag = async (req, res) => {
    const tag = req.tag;
    try {
    const { name } = req.body;
    tag.name = name;
    res.status(201).json(await tag.save());
  } catch (error) {
    console.log(`Error PATCH tags/${tag.id} :`, error);
    return res.status(500).json({ error });
  }
};

exports.deleteTag = async (req, res) => {
    const { id } = req.params;
    try {
    await req.tag.deleteOne();
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.log(`Error DELETE tags/${id} :`, error);
    return res.status(500).json({ error });
  }
};

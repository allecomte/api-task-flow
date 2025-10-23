const { default: mongoose } = require("mongoose");
const Project = require("../models/project.model");
const User = require("../models/user.model");
const {allExistByIds} = require('../utils/dbCheck.utils')

exports.createProject = async (req, res) => {
    const {members} = req.body;
    const allMembersExist = await allExistByIds(User, members);

    if (!allMembersExist) {
        return res.status(400).json({ error: "One or several members do not exist" });
    }

    console.log('Creating project with data:', req.body);
    res.status(200).json({ message: 'ok' });
};

exports.getProjects = async (req, res) => {
    console.log('Fetching all projects');
    res.status(200).json({ message: 'ok' });
};

exports.getProjectById = async (req, res) => {
    console.log('Fetching project with ID:', req.params.id);
    res.status(200).json({ message: 'ok' });
};

exports.updateProject = async (req, res, next) => {}

exports.deleteProject = async (req, res, next) => {}

exports.addOneMemberToOneProject = async (req, res, next) => {}

exports.deleteOneMemberFromOneProject = async (req, res, next) => {}
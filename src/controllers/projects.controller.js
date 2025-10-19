const { default: mongoose } = require("mongoose");
const Project = require("../models/project.model");

exports.createProject = async (req, res) => {
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
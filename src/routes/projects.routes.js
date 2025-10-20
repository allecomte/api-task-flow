const express = require('express');
const router = express.Router();
const {getProjects, getProjectById, createProject} = require('../controllers/projects.controller');
const {authToken,authRoles} = require('../middleware/auth');
const Role = require('../enum/role.enum');

router.use(authToken);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authRoles([Role.ROLE_MANAGER]), createProject);

module.exports = router;
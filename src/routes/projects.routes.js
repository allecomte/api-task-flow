const express = require('express');
const router = express.Router();
const {getProjects, getProjectById, createProject} = require('../controllers/projects.controller');
const {authToken,authRoles} = require('../middleware/auth');
const {validateBody} = require('../middleware/validation');
const Role = require('../enum/role.enum');
const {createProjectSchema} = require('../schemas/project.schema');

router.use(authToken);
router.post('/', authRoles([Role.ROLE_MANAGER]), validateBody(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.patch('/:id', authRoles([Role.ROLE_MANAGER]), createProject);
router.delete('/:id', authRoles([Role.ROLE_MANAGER]), createProject);

router.post('/:id/members', authRoles([Role.ROLE_MANAGER]), createProject);
router.delete('/:id/members/:userId', authRoles([Role.ROLE_MANAGER]), createProject);

module.exports = router;
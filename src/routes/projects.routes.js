const express = require('express');
const router = express.Router();
const {getProjects, getProjectById, createProject, updateProject, deleteProject, addOneMemberToOneProject, deleteOneMemberFromOneProject} = require('../controllers/projects.controller');
const {createProjectSchema, updateProjectSchema, addMemberToProjectSchema} = require('../schemas/project.schema');
// Enums
const Role = require('../enum/role.enum');
const Access = require('../enum/access.enum');
// Middlewares
const {authToken,authRoles} = require('../middleware/auth');
const {validateBody, validId} = require('../middleware/validation');
const {getProjectWithAccess} = require('../middleware/access');

router.use(authToken);
router.post('/', authRoles([Role.ROLE_MANAGER]), validateBody(createProjectSchema), createProject);
router.get('/', getProjects);
router.get('/:id', validId(), getProjectWithAccess(Access.MEMBERS_AND_MANAGERS, "title description startAt endAt members"), getProjectById);
router.patch('/:id', authRoles([Role.ROLE_MANAGER]), validId(), validateBody(updateProjectSchema), getProjectWithAccess(Access.ONLY_MANAGER_OWNER), updateProject);
router.delete('/:id', authRoles([Role.ROLE_MANAGER]), validId(), getProjectWithAccess(Access.ONLY_MANAGER_OWNER), deleteProject);

router.post('/:id/members', authRoles([Role.ROLE_MANAGER]), validId(), getProjectWithAccess(Access.ALL_MANAGERS), addOneMemberToOneProject);
router.delete('/:id/members/:userId', authRoles([Role.ROLE_MANAGER]), validId('id','userId'), validateBody(addMemberToProjectSchema), getProjectWithAccess(Access.ALL_MANAGERS), deleteOneMemberFromOneProject);



module.exports = router;
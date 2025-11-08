const express = require('express');
const router = express.Router();
const {createTask, getTasks ,getTaskById, updateTask, deleteTask, associateOrDissociateTagToTask} = require('../controllers/tasks.controller');
const {createTaskSchema, updateTaskSchema, taskQueryFilterSchema} = require('../schemas/task.schema');
// Models
const Project = require('../models/project.model');
const Task = require('../models/task.model');
// Middlewares
const {authToken,authRoles} = require('../middleware/auth');
const {validateBody, validId, validateQuery} = require('../middleware/validation');
const {createAccessMiddleware} = require('../middleware/access');
const { getTaskWithAccess } = createAccessMiddleware({ Project, Task });
// Enums
const Role = require('../enum/role.enum');
const Access = require('../enum/access.enum');

router.use(authToken);
router.post('/', authRoles([Role.ROLE_MANAGER]), validateBody(createTaskSchema), createTask);
router.get('/', validateQuery(taskQueryFilterSchema), getTasks);
router.get('/:id', validId(), getTaskWithAccess(Access.ASSIGNEE_AND_MANAGERS), getTaskById);
router.patch('/:id', validId(), validateBody(updateTaskSchema), getTaskWithAccess(Access.ASSIGNEE_AND_PROJECT_OWNER), updateTask);
router.delete('/:id', authRoles([Role.ROLE_MANAGER]), validId(), getTaskWithAccess(Access.ONLY_PROJECT_OWNER), deleteTask);

// Associate and dissociate tags to tasks
router.post('/:id/tags/:tagId', authRoles([Role.ROLE_MANAGER]), validId('id','tagId'), getTaskWithAccess(Access.ONLY_PROJECT_OWNER),associateOrDissociateTagToTask);

module.exports = router;
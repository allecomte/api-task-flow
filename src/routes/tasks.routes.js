const express = require('express');
const router = express.Router();
const {createTask, getTasks ,getTaskById, updateTask, deleteTask} = require('../controllers/tasks.controller');
const {createTaskSchema, updateTaskSchema} = require('../schemas/task.schema');
// Middlewares
const {authToken,authRoles} = require('../middleware/auth');
const {validateBody, validId} = require('../middleware/validation');
const {getTaskWithAccess} = require('../middleware/access');
// Enums
const Role = require('../enum/role.enum');
const Access = require('../enum/access.enum');

router.use(authToken);
router.post('/', authRoles([Role.ROLE_MANAGER]), validateBody(createTaskSchema), createTask);
router.get('/', getTasks);
router.get('/:id', validId(), getTaskWithAccess(Access.ASSIGNEE_AND_MANAGERS), getTaskById);
router.patch('/:id', validId(), validateBody(updateTaskSchema), getTaskWithAccess(Access.ASSIGNEE_AND_PROJECT_OWNER), updateTask);
router.delete('/:id', authRoles([Role.ROLE_MANAGER]), validId(), getTaskWithAccess(Access.ONLY_PROJECT_OWNER), deleteTask);

// Associate and dissociate tags to tasks
// router.post('/:id/tags');
// router.delete('/:id/tags/:tagId');

module.exports = router;
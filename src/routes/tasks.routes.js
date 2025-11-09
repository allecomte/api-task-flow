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

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Handle tasks
 */

/**
 * @swagger
 * /api/tasks:
 *      post:
 *          summary: Create a new task
 *          tags: [Tasks]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - title
 *                              - description
 *                              - dueAt
 *                              - assignee
 *                              - project
 *                          properties:
 *                              title:
 *                                  type: string
 *                              description:
 *                                  type: string
 *                              dueAt:
 *                                  type: string
 *                              priority:
 *                                  type: string
 *                              state:
 *                                  type: string
 *                              assignee:
 *                                  type: string
 *                              project:
 *                                  type: string
 *                              tags:
 *                                  type: array
 *                                  items:
 *                                      type: string
 *                                      description: Ids of tag
 *          responses:
 *              201:
 *                  description: Task successfully created
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Task'
 *              400:
 *                  description: Fail to create the task
 */
router.post('/', authRoles([Role.ROLE_MANAGER]), validateBody(createTaskSchema), createTask);

/**
 * @swagger
 * /api/tasks:
 *      get:
 *          summary: List the tasks
 *          tags: [Tasks]
 *          responses:
 *              200:
 *                  description: Successfully get the list of tasks
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Task'
 *              400:
 *                  description: Fail to list the tasks
 */
router.get('/', validateQuery(taskQueryFilterSchema), getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *      get:
 *          summary: Get one task
 *          tags: [Tasks]
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Task's Id
 *                schema:
 *                  type: string
 *                  format: string
 *          responses:
 *              200:
 *                  description: Successfully get the task's information
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Task'
 *              400:
 *                  description: Fail to get the task
 */
router.get('/:id', validId(), getTaskWithAccess(Access.ASSIGNEE_AND_MANAGERS), getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *      patch:
 *          summary: Update one task
 *          tags: [Tasks]
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Task's Id to update
 *                schema:
 *                  type: string
 *                  format: string
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              title:
 *                                  type: string
 *                              description:
 *                                  type: string
 *                              dueAt:
 *                                  type: string
 *                              priority:
 *                                  type: string
 *                              state:
 *                                  type: string
 *                              assignee:
 *                                  type: string
 *                              tags:
 *                                  type: array
 *                                  items:
 *                                      type: string
 *                                      description: Ids of tag
 *          responses:
 *              200:
 *                  description: The task's informations have been successfully updated
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Task'
 *              400:
 *                  description: Fail to update the task
 */
router.patch('/:id', validId(), validateBody(updateTaskSchema), getTaskWithAccess(Access.ASSIGNEE_AND_PROJECT_OWNER), updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *      delete:
 *          summary: Delete one task
 *          tags: [Tasks]
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Task's Id to delete
 *                schema:
 *                  type: string
 *                  format: string
 *          responses:
 *              200:
 *                  description: Successfully delete the task
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: string
 *                              description: Message to confirm deletion
 *              400:
 *                  description: Fail to delete the task
 */
router.delete('/:id', authRoles([Role.ROLE_MANAGER]), validId(), getTaskWithAccess(Access.ONLY_PROJECT_OWNER), deleteTask);

// Associate and dissociate tags to tasks
/**
 * @swagger
 * /api/tasks/{id}/tags/{tagId}:
 *      post:
 *          summary: Associate or dissociate a tag to a task
 *          tags: [Tasks]
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Task's Id to associate or dissociate the tag to
 *                schema:
 *                  type: string
 *                  format: string
 *              - name: tagId
 *                in: path
 *                required: true
 *                description: Tag's Id to be associated or dissociated to the task
 *                schema:
 *                  type: string
 *                  format: string
 *          responses:
 *              200:
 *                  description: Tag has been successfully associated or dissociated to the task
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: string
 *                              description: Message to confirm the association or dissociation between the task and the tag
 *              400:
 *                  description: Fail to associate or dissociate the tag to the task
 */
router.post('/:id/tags/:tagId', authRoles([Role.ROLE_MANAGER]), validId('id','tagId'), getTaskWithAccess(Access.ONLY_PROJECT_OWNER),associateOrDissociateTagToTask);

module.exports = router;
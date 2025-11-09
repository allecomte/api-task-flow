const express = require('express');
const router = express.Router();
const {getProjects, getProjectById, createProject, updateProject, deleteProject, addOneMemberToOneProject, deleteOneMemberFromOneProject} = require('../controllers/projects.controller');
const {createProjectSchema, updateProjectSchema, addMemberToProjectSchema} = require('../schemas/project.schema');
// Enums
const Role = require('../enum/role.enum');
const Access = require('../enum/access.enum');
// Models
const Project = require('../models/project.model');
// Middlewares
const {authToken,authRoles} = require('../middleware/auth');
const {validateBody, validId} = require('../middleware/validation');
const {createAccessMiddleware} = require('../middleware/access');
const { getProjectWithAccess } = createAccessMiddleware({ Project });

router.use(authToken);

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Handle projects
 */

/**
 * @swagger
 * /api/projects:
 *      post:
 *          summary: Create a new project
 *          tags: [Projects]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - title
 *                              - description
 *                              - startAt
 *                          properties:
 *                              title:
 *                                  type: string
 *                              description:
 *                                  type: string
 *                              startAt:
 *                                  type: string
 *                              endAt:
 *                                  type: string
 *                              members:
 *                                  type: array
 *                                  items:
 *                                      type: string
 *                                      description: Ids of user
 *          responses:
 *              201:
 *                  description: Project successfully created
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Project'
 *              400:
 *                  description: Fail to create the project
 */
router.post('/', authRoles([Role.ROLE_MANAGER]), validateBody(createProjectSchema), createProject);

/**
 * @swagger
 * /api/projects:
 *      get:
 *          summary: List the projects
 *          tags: [Projects]
 *          responses:
 *              200:
 *                  description: Successfully get the list of projects
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Project'
 *              400:
 *                  description: Fail to list the projects
 */
router.get('/', getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *      get:
 *          summary: Get one project
 *          tags: [Projects]
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Project's Id
 *                schema:
 *                  type: string
 *                  format: string
 *          responses:
 *              200:
 *                  description: Successfully get the project's information
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Project'
 *              400:
 *                  description: Fail to get the project
 */
router.get('/:id', validId(), getProjectWithAccess(Access.MEMBERS_AND_MANAGERS, "title description startAt endAt members"), getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *      patch:
 *          summary: Update one project
 *          tags: [Projects]
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Project's Id to update
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
 *                              startAt:
 *                                  type: string
 *                              endAt:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: The project's informations have been successfully updated
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Project'
 *              400:
 *                  description: Fail to update the project
 */
router.patch('/:id', authRoles([Role.ROLE_MANAGER]), validId(), validateBody(updateProjectSchema), getProjectWithAccess(Access.ONLY_MANAGER_OWNER), updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *      delete:
 *          summary: Delete one project
 *          tags: [Projects]
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Project's Id to delete
 *                schema:
 *                  type: string
 *                  format: string
 *          responses:
 *              200:
 *                  description: Successfully delete the project
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: string
 *                              description: Message to confirm deletion
 *              400:
 *                  description: Fail to delete the project
 */
router.delete('/:id', authRoles([Role.ROLE_MANAGER]), validId(), getProjectWithAccess(Access.ONLY_MANAGER_OWNER), deleteProject);

/**
 * @swagger
 * /api/projects/{id}/members:
 *      post:
 *          summary: Add a member to a project
 *          tags: [Projects]
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Project's Id to add a member to
 *                schema:
 *                  type: string
 *                  format: string
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - member
 *                          properties:
 *                              member:
 *                                  type: string
 *                                  description: User's Id
 *          responses:
 *              200:
 *                  description: Member has been successfully added to the project
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Project'
 *              400:
 *                  description: Fail to add member to the project
 */
router.post('/:id/members', authRoles([Role.ROLE_MANAGER]), validId(), getProjectWithAccess(Access.ALL_MANAGERS), addOneMemberToOneProject);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *      delete:
 *          summary: Remove a member from the project
 *          tags: [Projects]
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Project's Id to remove a member from
 *                schema:
 *                  type: string
 *                  format: string
 *              - name: userId
 *                in: path
 *                required: true
 *                description: User's Id to be removed as member from the project
 *                schema:
 *                  type: string
 *                  format: string
 *          responses:
 *              200:
 *                  description: Member has been successfully removed from the project
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: string
 *                              description: Message to confirm removal of the member
 *              400:
 *                  description: Fail to remove the member from the project
 */
router.delete('/:id/members/:userId', authRoles([Role.ROLE_MANAGER]), validId('id','userId'), validateBody(addMemberToProjectSchema), getProjectWithAccess(Access.ALL_MANAGERS), deleteOneMemberFromOneProject);



module.exports = router;
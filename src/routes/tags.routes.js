const express = require('express');
const router = express.Router();
const {createTag, getTagsByProject: getTagsByProject, updateTag, deleteTag} = require('../controllers/tags.controller');
const {createOrUpdateTagSchema} = require('../schemas/tag.schema');
// Models
const Project = require('../models/project.model');
const Task = require('../models/tag.model');
const Tag = require('../models/tag.model');
// Middlewares
const {authToken} = require('../middleware/auth');
const {validateBody, validId} = require('../middleware/validation');
const {createAccessMiddleware} = require('../middleware/access');
const { getTagWithAccess } = createAccessMiddleware({ Project, Task, Tag });
// Enums
const Access = require('../enum/access.enum');

router.use(authToken);

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Handle tags
 */

/**
 * @swagger
 * /api/projects/{projectId}/tags:
 *      post:
 *          summary: Create a new Tag associated to a project
 *          tags: [Tags]
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - name: projectId
 *                in: path
 *                required: true
 *                description: Project's Id to be associated to the tag
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
 *                              - name
 *                          properties:
 *                              name:
 *                                  type: string
 *          responses:
 *              201:
 *                  description: Tag successfully created
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Tag'
 *              400:
 *                  description: Fail to create the tag
 */
router.post('/projects/:projectId/tags', validId('projectId'), validateBody(createOrUpdateTagSchema), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), createTag);

/**
 * @swagger
 * /api/projects/{projectId}/tags:
 *      get:
 *          summary: Get all tags associated to one project
 *          tags: [Tags]
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - name: projectId
 *                in: path
 *                required: true
 *                description: Project's to be associated to the tags
 *                schema:
 *                  type: string
 *                  format: string
 *          responses:
 *              200:
 *                  description: Successfully get the project's tags
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/Tag'
 *              400:
 *                  description: Fail to get the project's tags
 */
router.get('/projects/:projectId/tags', validId('projectId'), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), getTagsByProject);

/**
 * @swagger
 * /api/tags/{id}:
 *      patch:
 *          summary: Update one tag
 *          tags: [Tags]
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Tag's Id to update
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
 *                              name:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: The tag's name has been successfully updated
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/Tag'
 *              400:
 *                  description: Fail to update the tag
 */
router.patch('/tags/:id', validId(), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), updateTag);

/**
 * @swagger
 * /api/tags/{id}:
 *      delete:
 *          summary: Delete one tag
 *          tags: [Tags]
 *          security:
 *              - bearerAuth: []
 *          parameters:
 *              - name: id
 *                in: path
 *                required: true
 *                description: Tag's Id to delete
 *                schema:
 *                  type: string
 *                  format: string
 *          responses:
 *              200:
 *                  description: Successfully delete the tag
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: string
 *                              description: Message to confirm deletion
 *              400:
 *                  description: Fail to delete the tag
 */
router.delete('/tags/:id', validId(), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), deleteTag);

module.exports = router;
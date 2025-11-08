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

router.post('/projects/:projectId/tags', validId('projectId'), validateBody(createOrUpdateTagSchema), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), createTag);
router.get('/projects/:projectId/tags', validId('projectId'), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), getTagsByProject);
router.patch('/tags/:id', validId(), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), updateTag);
router.delete('/tags/:id', validId(), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), deleteTag);

module.exports = router;
const express = require('express');
const router = express.Router();
const {createTag, getTagsByProject: getTagsByProject, updateTag, deleteTag} = require('../controllers/tags.controller');
const {createOrUpdateTagSchema} = require('../schemas/tag.schema');
// Middlewares
const {authToken} = require('../middleware/auth');
const {validateBody, validId} = require('../middleware/validation');
const {getTagWithAccess} = require('../middleware/access');
// Enums
const Access = require('../enum/access.enum');

router.use(authToken);

router.post('/projects/:projectId/tags', validId('projectId'), validateBody(createOrUpdateTagSchema), getTagWithAccess(Access.ONLY_PROJECT_OWNER), createTag);
router.get('/projects/:projectId/tags', validId('projectId'), getTagWithAccess(Access.MEMBERS_AND_MANAGERS), getTagsByProject);
router.patch('/tags/:id', validId(), getTagWithAccess(Access.ONLY_PROJECT_OWNER), updateTag);
router.delete('/tags/:id', validId(), getTagWithAccess(Access.ONLY_PROJECT_OWNER), deleteTag);

module.exports = router;
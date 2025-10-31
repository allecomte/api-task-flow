const express = require('express');
const router = express.Router();
const {createTag, getTags ,getTagById, updateTag, deleteTag} = require('../controllers/tags.controller');
// Middlewares
const {authToken} = require('../middleware/auth');
const {validateBody, validId} = require('../middleware/validation');
const {getTagWithAccess} = require('../middleware/access');
// Enums
const Access = require('../enum/access.enum');

router.use(authToken);

// router.post('/projects/:id/tags', validateBody(createProjectSchema), createTag);
// router.get('/projects/:id/tags', validId(), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), getTagById);
// router.patch('/tags/:id', validId(), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), getTagById);
// router.delete('/tags/:id', validId(), getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER), getTagById);

module.exports = router;
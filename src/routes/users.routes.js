const express = require('express');
const router = express.Router();
const {register, login} = require('../controllers/users.controller');
const {validateBody} = require('../middleware/validation');
const {registerUserSchema, loginUserSchema} = require('../schemas/user.schema');

router.post('/register', validateBody(registerUserSchema), register);
router.post('/login', validateBody(loginUserSchema), login);

module.exports = router;
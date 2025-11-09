const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/users.controller");
const { validateBody } = require("../middleware/validation");
const {
  registerUserSchema,
  loginUserSchema,
} = require("../schemas/user.schema");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User's management
 */

/**
 * @swagger
 * /api/users/register:
 *      post:
 *          summary: Register a new user
 *          tags: [Users]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - email
 *                              - password
 *                              - firstname
 *                              - lastname
 *                          properties:
 *                              email:
 *                                  type: string
 *                              password:
 *                                  type: string
 *                              firstname:
 *                                  type: string
 *                              lastname:
 *                                  type: string
 *                              roles:
 *                                  type: array
 *                                  items:
 *                                      type: string
 *                                      description: User's roles
 *          responses:
 *              201:
 *                  description: User successfully created
 *              400:
 *                  description: Password is not validated
 *              409:
 *                  description: The email has already been associated to an account
 */
router.post("/register", validateBody(registerUserSchema), register);

/**
 * @swagger
 * /api/users/login:
 *      post:
 *          summary: Login a user
 *          tags: [Users]
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          required:
 *                              - email
 *                              - password
 *                          properties:
 *                              email:
 *                                  type: string
 *                              password:
 *                                  type: string
 *          responses:
 *              201:
 *                  description: User successfully logged
 *              400:
 *                  description: Credentials invalid
 */
router.post("/login", validateBody(loginUserSchema), login);

module.exports = router;

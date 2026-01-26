const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  getUsers,
  updateProfile,
  updatePassword
} = require("../controllers/users.controller");
const { authToken } = require("../middleware/auth");
const { validateBody, validId } = require("../middleware/validation");
const {
  registerUserSchema,
  loginUserSchema,
  updateProfileSchema,
  updatePasswordSchema
} = require("../schemas/user.schema");
const rateLimit = require("express-rate-limit");

const emailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requêtes max par email
  message: {
    status: 429,
    error: "Too many login attempts, please try again later.",
  },
  standardHeaders: true, // inclut les headers RateLimit
  legacyHeaders: false,
  keyGenerator: (req) => req.body.email,
});

const ipRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requêtes max par IP
  message: {
    status: 429,
    error: "Too many login attempts, please try again later.",
  },
  standardHeaders: true, // inclut les headers RateLimit
  legacyHeaders: false,
});

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
router.post(
  "/register",
  emailRateLimiter,
  ipRateLimiter,
  validateBody(registerUserSchema),
  register
);

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
 *              200:
 *                  description: User successfully logged
 *              400:
 *                  description: Credentials invalid
 */
router.post(
  "/login",
  emailRateLimiter,
  ipRateLimiter,
  validateBody(loginUserSchema),
  login
);

/**
 * @swagger
 * /api/users/profile:
 *      get:
 *          summary: Get the profile of the logged-in user
 *          tags: [Users]
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Successfully get the user's profile
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/User'
 *              401:
 *                  description: Unauthorized
 */
router.get("/profile", authToken, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *      patch:
 *          summary: Update users's profile informations
 *          tags: [Users]
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              firstname:
 *                                  type: string
 *                              lastname:
 *                                  type: string
 *                              email:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: The user's profile informations have been successfully updated
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/User'
 *              400:
 *                  description: Fail to update the user's profile informations
 */
router.patch('/profile', authToken, validateBody(updateProfileSchema), updateProfile);

/**
 * @swagger
 * /api/users/password:
 *      patch:
 *          summary: Update users's password
 *          tags: [Users]
 *          security:
 *              - bearerAuth: []
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              currentPassword:
 *                                  type: string
 *                              newPassword:
 *                                  type: string
 *          responses:
 *              200:
 *                  description: The user's password have been successfully updated
 *                  content:
 *                      application/json:
 *                          schema:
 *                              $ref: '#/components/schemas/User'
 *              400:
 *                  description: Fail to update the user's password
 */
router.patch('/password', authToken, validateBody(updatePasswordSchema), updatePassword);

/**
 * @swagger
 * /api/users:
 *      get:
 *          summary: List the users
 *          tags: [Users]
 *          security:
 *              - bearerAuth: []
 *          responses:
 *              200:
 *                  description: Successfully get the list of users
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  $ref: '#/components/schemas/User'
 *              400:
 *                  description: Fail to list the users
 */
router.get('/', authToken, getUsers);

module.exports = router;

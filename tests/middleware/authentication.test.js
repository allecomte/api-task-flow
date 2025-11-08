const jwt = require("jsonwebtoken");
// Middlewares
const { authToken, authRoles } = require("../../src/middleware/auth");
// Models
const User = require("../../src/models/user.model");
// Fixtures
const { users, managers } = require("../fixtures/user.fixture");
// Enums
const Role = require("../../src/enum/role.enum");

describe("Middleware", () => {
  process.env.SKIP_CLEANUP = "true";
  let req, res, next, user, manager;
  beforeAll(async () => {
    user = await User.create(users[0]);
    manager = await User.create(managers[0]);
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  /**
   * Testing  auth with token
   * Result expected : access granted for valid token
   */
  it("should call next and attach user when token is valid", async () => {
    const payload = { user: {
      id: user._id,
      email: user.email,
      roles: user.roles,
    }};
    const validToken = jwt.sign(payload, process.env.JWT_SECRET);
    req.header.mockReturnValue(`Bearer ${validToken}`);
    authToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(user._id.toString());
    expect(res.status).not.toHaveBeenCalled();
  });

  /**
   * Testing  auth with token
   * Result expected : access refused for no token
   */
  it("should return 401 if no token is provided", () => {
    req.header.mockReturnValue(undefined);

    authToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  /**
   * Testing  auth with token
   * Result expected : access refused for invalid token
   */
  it("should return 401 if token is invalid", () => {
    req.header.mockReturnValue("Bearer invalid.token.here");

    authToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token is not valid" });
  });

  /**
   * Testing auth with role : ROLE_MANAGER
   * Result expected : access refused for a user with ROLE_USER
   */
  it("should not allow to continue when role doesn't match", async () => {
    req = { user: user };
    await authRoles([Role.ROLE_MANAGER])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  /**
   * Testing auth with role : ROLE_MANAGER
   * Result expected : access granted for a manager with ROLE_MANAGER
   */
  it("should allow to continue role is matching", async () => {
    req = { user: user };
    await authRoles([Role.ROLE_MANAGER])(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

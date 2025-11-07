const { createAccessMiddleware } = require("../../src/middleware/access_test");
const Project = require("../../src/models/project.model");
const User = require("../../src/models/user.model");
const { getProjectWithAccess } = createAccessMiddleware({ Project });
const { getProjectById } = require("../../src/controllers/projects.controller");
const { projects } = require("../api/project.fixture");
const { users, managers } = require("../api/user.fixture");
const Access = require("../../src/enum/access.enum");

describe("GET /projects/:id", () => {
  process.env.SKIP_CLEANUP = "true";
  let req, res, next, project, owner, member, userNotMember;
  beforeAll(async () => {
    owner = await User.create(managers[0]);
    member = await User.create(users[0]);
    project = await Project.create({
      title: projects[0].title,
      description: projects[0].description,
      startAt: projects[0].startAt,
      endAt: projects[0].endAt,
      owner: owner._id,
      members: [member._id.toString()],
    });
    userNotMember = await User.create(users[1]);
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should not allow a user to access a project they are not a member of", async () => {
    req = { params: { id: project._id.toString() }, user: userNotMember };
    await getProjectWithAccess(Access.MEMBERS_AND_MANAGERS)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should allow a member to access the project", async () => {
    req = { params: { id: project._id.toString() }, user: member };
    await getProjectWithAccess(Access.MEMBERS_AND_MANAGERS)(req, res, next);
    expect(req.project).toBeDefined();
    expect(req.project.title).toBe(project.title);
    expect(next).toHaveBeenCalled();

    await getProjectById(req,res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.project);
  });
});

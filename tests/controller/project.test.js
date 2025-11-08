// Models
const Project = require("../../src/models/project.model");
const User = require("../../src/models/user.model");
// Middlewares
const { createAccessMiddleware } = require("../../src/middleware/access");
const { getProjectWithAccess } = createAccessMiddleware({ Project });
const { authRoles } = require("../../src/middleware/auth");
// Controllers
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addOneMemberToOneProject,
  deleteOneMemberFromOneProject,
} = require("../../src/controllers/projects.controller");
// Fixtures
const { projects } = require("../fixtures/project.fixture");
const { users, managers } = require("../fixtures/user.fixture");
// Enums
const Access = require("../../src/enum/access.enum");
const Role = require("../../src/enum/role.enum");

describe("Project middleware and controller", () => {
  process.env.SKIP_CLEANUP = "true";
  let req, res, next, project, owner, managerNotOwner, member, userNotMember;
  beforeAll(async () => {
    owner = await User.create(managers[0]);
    managerNotOwner = await User.create(managers[1]);
    member = await User.create(users[0]);
    userNotMember = await User.create(users[1]);
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  /**
   * Testing auth with role  : ROLE_MANAGER
   * Result expected : access granted for a manager with ROLE_MANAGER
   * Testing project.controller : createProject()
   */
  it("should allow a manager to create a new project", async () => {
    req = {
      body: {
        title: projects[0].title,
        description: projects[0].description,
        startAt: projects[0].startAt,
        endAt: projects[0].endAt,
        members: [member._id.toString()],
      },
      user: owner,
    };
    await authRoles([Role.ROLE_MANAGER])(req, res, next);
    expect(next).toHaveBeenCalled();

    await createProject(req, res);
    expect(res.status).toHaveBeenCalledWith(201);

    const savedProject = res.json.mock.calls.at(-1)[0];
    project = savedProject;
  });

  /**
   * Testing to filter the list of projects according the user's membership
   * Result expected : 1 project for member and 0 project for userNotMember
   * Testing project.controller : getProjects()
   */
  it("should only return projects allowed to be seen", async () => {
    req = { user: member };
    await getProjects(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    const resultMember = res.json.mock.calls.at(-1)[0];
    expect(resultMember).toHaveLength(1);

    req = { user: userNotMember };
    await getProjects(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    const resultNotMember = res.json.mock.calls.at(-1)[0];
    expect(resultNotMember).toHaveLength(0);
  })

  /**
   * Testing access policy : MEMBERS_AND_MANAGERS
   * Result expected : access refused for a user not member of the project
   */
  it("should not allow a user to access a project they are not a member of", async () => {
    req = { params: { id: project._id.toString() }, user: userNotMember };
    await getProjectWithAccess(Access.MEMBERS_AND_MANAGERS)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });

  /**
   * Testing access policy : MEMBERS_AND_MANAGERS
   * Result expected : access granted for a project's member
   * Testing project.controller : getProjectById()
   */
  it("should allow a member to access the project", async () => {
    req = { params: { id: project._id.toString() }, user: member };
    await getProjectWithAccess(Access.MEMBERS_AND_MANAGERS)(req, res, next);
    expect(req.project).toBeDefined();
    expect(req.project.title).toBe(project.title);
    expect(next).toHaveBeenCalled();

    await getProjectById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.project);
  });

  /**
   * Testing access policy : ONLY_MANAGER_OWNER
   * Result expected : access granted for the project's owner
   * Testing project.controller : updateProject()
   */
  it("should update a project by its owner", async () => {
    req = {
      params: { id: project._id.toString() },
      body: { title: "Project test" },
      user: owner,
    };
    await getProjectWithAccess(Access.ONLY_MANAGER_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await updateProject(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.project);
  });

  /**
   * Testing access policy : ONLY_MANAGER_OWNER
   * Result expected : access refused for a manager not owner of the project
   */
  it("should not allow a non owner to update or delete a project", async () => {
    req = { params: { id: project._id.toString() }, user: managerNotOwner };
    await getProjectWithAccess(Access.ONLY_MANAGER_OWNER)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });

  /**
   * Testing access policy : ONLY_MANAGER_OWNER
   * Result expected : access granted for the project's owner
   * Testing project.controller : addOneMemberToOneProject()
   */
  it("should add a member to a project by its owner", async () => {
    req = {
      params: { id: project._id.toString() },
      body: { member: userNotMember._id },
      user: owner,
    };
    await getProjectWithAccess(Access.ONLY_MANAGER_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await addOneMemberToOneProject(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.project);
    expect(req.project.members).toContainEqual(userNotMember._id);
  });

  /**
   * Testing access policy : ONLY_MANAGER_OWNER
   * Result expected : access granted for the project's owner
   * Testing project.controller : deleteOneMemberFromOneProject()
   */
  it("should remove a member from a project by its owner", async () => {
    req = {
      params: {
        id: project._id.toString(),
        userId: userNotMember._id.toString(),
      },
      user: owner,
    };
    await getProjectWithAccess(Access.ONLY_MANAGER_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await deleteOneMemberFromOneProject(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.project);
    expect(req.project.members.map((m) => m.toString())).not.toContain(
      userNotMember._id.toString()
    );
  });

  /**
   * Testing access policy : ALL_MANAGERS
   * Result expected : access refused for a user
   */
  it("should not allow a user to add or remove a member to a project", async () => {
    req = {
      params: { id: project._id.toString() },
      body: { member: userNotMember._id },
      user: member,
    };
    await getProjectWithAccess(Access.ALL_MANAGERS)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });

  /**
   * Testing access policy : ALL_MANAGERS
   * Result expected : access granted for the project's owner
   * Testing project.controller : deleteOneMemberFromOneProject()
   */
  it("should delete a project by its owner", async () => {
    req = { params: { id: project._id.toString() }, user: managerNotOwner };
    await getProjectWithAccess(Access.ALL_MANAGERS)(req, res, next);
    expect(next).toHaveBeenCalled();

    await deleteProject(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await getProjectWithAccess(Access.ALL_MANAGERS)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

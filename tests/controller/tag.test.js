// Models
const User = require("../../src/models/user.model");
const Project = require("../../src/models/project.model");
const Task = require("../../src/models/task.model");
const Tag = require("../../src/models/tag.model");
// Middlewares
const { createAccessMiddleware } = require("../../src/middleware/access");
const { getTagWithAccess } = createAccessMiddleware({ Project, Task, Tag });
// Controllers
const {
  createTag,
  getTagsByProject,
  updateTag,
  deleteTag,
} = require("../../src/controllers/tags.controller");
// Fixtures
const { projects } = require("../fixtures/project.fixture");
const { users, managers } = require("../fixtures/user.fixture");
const { tasks } = require("../fixtures/task.fixture");
const { tags } = require("../fixtures/tag.fixture");
// Enums
const Access = require("../../src/enum/access.enum");
const State = require("../../src/enum/state.enum");

describe("Tag middleware and controller", () => {
  process.env.SKIP_CLEANUP = "true";
  let req,
    res,
    next,
    project,
    owner,
    managerNotOwner,
    member,
    userNotMember,
    task,
    tag;
  beforeAll(async () => {
    owner = await User.create(managers[0]);
    managerNotOwner = await User.create(managers[1]);
    member = await User.create(users[0]);
    userNotMember = await User.create(users[1]);
    project = await Project.create({
      title: projects[0].title,
      description: projects[0].description,
      startAt: projects[0].startAt,
      endAt: projects[0].endAt,
      owner: owner._id,
      members: [member._id.toString()],
    });
    task = await Task.create({
      title: tasks[0].title,
      description: tasks[0].description,
      state: tasks[0].state,
      priority: tasks[0].priority,
      dueAt: tasks[0].dueAt,
      assignee: member._id.toString(),
      project: project._id.toString(),
    });
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  /**
   * Testing access policy : MEMBERS_AND_PROJECT_OWNER
   * Result expected : access refused
   */
  it("should not allow a manager who is not project's owner to create a tag", async () => {
    req = {
      project: project,
      params: { projectId: project._id.toString() },
      body: {
        name: tags[0].name,
      },
      user: managerNotOwner,
    };
    await getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });

  /**
   * Testing access policy : MEMBERS_AND_PROJECT_OWNER
   * Result expected : access granted for project's owner
   * Testing project.controller : createTag
   */
  it("should allow the project's owner to create a tag", async () => {
    req = {
      project: project,
      params: { projectId: project._id.toString() },
      body: {
        name: tags[0].name,
      },
      user: owner,
    };
    await getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await createTag(req, res);
    expect(res.status).toHaveBeenCalledWith(201);

    const savedTag = res.json.mock.calls.at(-1)[0];
    tag = savedTag;
  });

  /**
   * Testing access policy : MEMBERS_AND_PROJECT_OWNER
   * Result expected : access granted for project's member
   * Testing project.controller : getTagsByProject
   */
  it("should list tags by project", async () => {
    req = {
      project: project,
      params: { projectId: project._id.toString() },
      user: member,
    };
    await getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await getTagsByProject(req, res);
    expect(res.status).toHaveBeenCalledWith(201);

    const result = res.json.mock.calls.at(-1)[0];
    expect(result).toHaveLength(1);
  });

  /**
   * Testing access policy : MEMBERS_AND_PROJECT_OWNER
   * Result expected : access granted for project's member
   * Testing project.controller : updateTag
   */
  it("should allow a member to update his project's tag", async () => {
    req = {
      project: project,
      body: { name: "Tag test" },
      params: { id: tag._id.toString() },
      user: member,
    };
    await getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await updateTag(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.tag);
  });

  /**
   * Testing access policy : MEMBERS_AND_PROJECT_OWNER
   * Result expected : access granted for project's member
   * Testing project.controller : deleteTag
   */
  it("should allow a member to delete his project's tag", async () => {
    req = {
      project: project,
      params: { id: tag._id.toString() },
      user: member,
    };
    await getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await deleteTag(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await getTagWithAccess(Access.MEMBERS_AND_PROJECT_OWNER)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

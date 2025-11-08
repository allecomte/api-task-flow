const { default: mongoose } = require("mongoose");
// Models
const User = require("../../src/models/user.model");
const Project = require("../../src/models/project.model");
const Task = require("../../src/models/task.model");
const Tag = require("../../src/models/tag.model");
// Middlewares
const { createAccessMiddleware } = require("../../src/middleware/access");
const { getTaskWithAccess } = createAccessMiddleware({ Project, Task });
// Controllers
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  associateOrDissociateTagToTask,
  deleteTask,
} = require("../../src/controllers/tasks.controller");
// Fixtures
const { projects } = require("../fixtures/project.fixture");
const { users, managers } = require("../fixtures/user.fixture");
const { tasks } = require("../fixtures/task.fixture");
const { tags } = require("../fixtures/tag.fixture");
// Enums
const Access = require("../../src/enum/access.enum");
const State = require("../../src/enum/state.enum");

describe("Task middleware and controller", () => {
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
    tag = await Tag.create({
      name: tags[0].name,
      project: project._id,
    });
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  /**
   * Testing to create a task by a manager who doesn't own the project
   * Result expected : access refused
   */
  it("should not allow a manager who is not project's owner to create a task", async () => {
    req = {
      body: {
        title: tasks[0].title,
        description: tasks[0].description,
        state: tasks[0].state,
        priority: tasks[0].priority,
        dueAt: tasks[0].dueAt,
        assignee: member._id.toString(),
        project: project._id.toString(),
      },
      user: managerNotOwner,
    };
    await createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  /**
   * Testing to create a task with a project's id that doesn't exist
   * Result expected : access refused
   */
  it("should not allow to create a task as project associated doesn't exist", async () => {
    const projectFakeId = new mongoose.Types.ObjectId();
    req = {
      body: {
        title: tasks[0].title,
        description: tasks[0].description,
        state: tasks[0].state,
        priority: tasks[0].priority,
        dueAt: tasks[0].dueAt,
        assignee: member._id.toString(),
        project: projectFakeId.toString(),
      },
      user: owner,
    };
    await createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  /**
   * Testing to create a task with an assignee who isn't member of the project
   * Result expected : access refused
   */
  it("should not allow to create a task as the assignee is not a member", async () => {
    req = {
      body: {
        title: tasks[0].title,
        description: tasks[0].description,
        state: tasks[0].state,
        priority: tasks[0].priority,
        dueAt: tasks[0].dueAt,
        assignee: userNotMember._id.toString(),
        project: project._id.toString(),
      },
      user: owner,
    };
    await createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  /**
   * Testing to create a task by a manager who owns the project
   * Result expected : access granted
   * Testing project.controller : createTask()
   */
  it("should allow the project's owner to create a task", async () => {
    req = {
      body: {
        title: tasks[0].title,
        description: tasks[0].description,
        state: tasks[0].state,
        priority: tasks[0].priority,
        dueAt: tasks[0].dueAt,
        assignee: member._id.toString(),
        project: project._id.toString(),
      },
      user: owner,
    };
    await createTask(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    const taskSaved = res.json.mock.calls.at(-1)[0];
    task = taskSaved;
  });

  /**
   * Testing to filter the list of tasks according the user's tasks
   * Result expected : 1 task for member and 0 task for userNotMember
   * Testing project.controller : getProjects()
   */
  it("should only return tasks allowed to be seen", async () => {
    req = {
      user: member,
      filters: {},
      pagination: { page: 1, limit: 10, skip: 0 },
      sort: { createdAt: -1 },
    };

    await getTasks(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const resultAssignee = res.json.mock.calls.at(-1)[0];
    expect(resultAssignee.data).toHaveLength(1);

    req = {
      user: userNotMember,
      filters: {},
      pagination: { page: 1, limit: 10, skip: 0 },
      sort: { createdAt: -1 },
    };
    await getTasks(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const resultNotAssignee = res.json.mock.calls.at(-1)[0];
    expect(resultNotAssignee.data).toHaveLength(0);
  });

  /**
   * Testing access policy : ASSIGNEE_AND_MANAGERS
   * Result expected : access refused for a user not assigned to the task
   */
  it("should not allow a user to access a task if he is not assigned to it", async () => {
    req = { params: { id: task._id.toString() }, user: userNotMember };
    await getTaskWithAccess(Access.ASSIGNEE_AND_MANAGERS)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });

  /**
   * Testing access policy : ASSIGNEE_AND_MANAGERS
   * Result expected : access granted for a user assigned to the task
   * Testing project.controller : getTaskById()
   */
  it("should allow a user to access his task", async () => {
    req = { params: { id: task._id.toString() }, user: member };
    await getTaskWithAccess(Access.ASSIGNEE_AND_MANAGERS)(req, res, next);
    expect(req.project).toBeDefined();
    expect(req.task).toBeDefined();
    expect(req.task.title).toBe(task.title);
    expect(next).toHaveBeenCalled();

    await getTaskById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.task);
  });

  /**
   * Testing access policy : ASSIGNEE_AND_PROJECT_OWNER
   * Result expected : access granted for the owner of the task's project
   * Testing project.controller : updateTask()
   */
  it("should update a task as a owner", async () => {
    req = {
      params: { id: task._id.toString() },
      body: { title: "Task test" },
      user: owner,
    };
    await getTaskWithAccess(Access.ASSIGNEE_AND_PROJECT_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.task);
  });

  /**
   * Testing access policy : ASSIGNEE_AND_PROJECT_OWNER
   * Result expected : access granted for the owner of the task's project
   * Testing project.controller : updateTask()
   */
  it("should update a task as a assignee", async () => {
    req = {
      params: { id: task._id.toString() },
      body: { state: State.IN_PROGRESS },
      user: member,
    };
    await getTaskWithAccess(Access.ASSIGNEE_AND_PROJECT_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await updateTask(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(req.task);

    // However the the assignee can't modify any other fields
    req = {
      params: { id: task._id.toString() },
      body: { title: "Task" },
      user: member,
    };
    await getTaskWithAccess(Access.ASSIGNEE_AND_PROJECT_OWNER)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  /**
   * Testing access policy : ONLY_PROJECT_OWNER
   * Result expected : access refused for the task's assigne
   */
  it("should not allow a non owner to associate a tag to a task", async () => {
    req = {
      params: { id: task._id.toString(), tagId: tag._id.toString() },
      user: member,
    };
    await getTaskWithAccess(Access.ONLY_PROJECT_OWNER)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not authorized" });
  });

  /**
   * Testing access policy : ONLY_PROJECT_OWNER
   * Result expected : access granted for the project's owner associated to the task
   * Testing project.controller : associateOrDissociateTagToTask()
   */
  it("should allow the project's owner to associate a tag to a task", async () => {
    req = {
      params: { id: task._id.toString(), tagId: tag._id.toString() },
      user: owner,
    };
    await getTaskWithAccess(Access.ONLY_PROJECT_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await associateOrDissociateTagToTask(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Tag associated to task successfully",
    });
  });

  /**
   * Testing access policy : ONLY_PROJECT_OWNER
   * Result expected : access granted for the owner of the task's project
   * Testing project.controller : deleteTask()
   */
  it("should allow the project's owner to delete a task", async () => {
    req = {
      params: { id: task._id.toString() },
      user: owner,
    };
    await getTaskWithAccess(Access.ONLY_PROJECT_OWNER)(req, res, next);
    expect(next).toHaveBeenCalled();

    await deleteTask(req, res);
    expect(res.status).toHaveBeenCalledWith(200);

    await getTaskWithAccess(Access.ONLY_PROJECT_OWNER)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

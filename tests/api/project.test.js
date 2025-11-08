const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

const app = require("../../src/app");
const User = require("../../src/models/user.model");
const Project = require("../../src/models/project.model");
const { getTokenForUser } = require("../helpers");
// Fixture data
const { users, managers } = require("../fixtures/user.fixture");
const { projects } = require("../fixtures/project.fixture");

describe("Project API", () => {
  let owner, manager, member1, member2, userNotMember, project;

  beforeAll(async () => {
    owner = await User.create(managers[0]);
    manager = await User.create(managers[1]);
    member1 = await User.create(users[0]);
    member2 = await User.create(users[1]);
    userNotMember = await User.create(users[2]);
  });

  it("should create a new project", async () => {
    const token = getTokenForUser(owner);

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: projects[0].title,
        description: projects[0].description,
        startAt: projects[0].startAt,
        endAt: projects[0].endAt,
        members: [member1._id.toString(), member2._id.toString()],
      });
      project = res.body;
    expect(res.statusCode).toEqual(201);
  });

  it("should not allow ROLE_USER to create a project", async () => {
    const tokenUser = getTokenForUser(member1);

    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${tokenUser}`)
      .send({
        title: projects[1].title,
        description: projects[1].description,
        startAt: projects[1].startAt,
        endAt: projects[1].endAt,
      });
    expect(res.statusCode).toEqual(403);
  });

  it("should get projects for a manager", async () => {
    const token = getTokenForUser(manager);

    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
  });

  it("should get projects for a user", async () => {
    const token = getTokenForUser(member1);

    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${token}`);
      console.log(project._id.toString());
      console.log(res.body);
    expect(res.statusCode).toEqual(200);
  });
});

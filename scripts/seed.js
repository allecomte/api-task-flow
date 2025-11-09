const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
// Models
const User = require("../src/models/user.model");
const Project = require("../src/models/project.model");
const Task = require("../src/models/task.model");
const Tag = require("../src/models/tag.model");
// Fixtures
const { users, managers } = require("../tests/fixtures/user.fixture");
const { projects } = require("../tests/fixtures/project.fixture");
const { tasks } = require("../tests/fixtures/task.fixture");
const { tags } = require("../tests/fixtures/tag.fixture");

dotenv.config();

const usersCreated = [];
const managersCreated = [];
const projectsCreated = [];
const tasksCreated = [];
const tagsCreated = [];

async function connect() {
  try {
    await mongoose.connect(
      "mongodb+srv://" +
        process.env.DB_USER +
        ":" +
        process.env.DB_PASSWORD +
        "@cluster0.bjlx6z4.mongodb.net/" +
        process.env.DB_NAME +
        "?retryWrites=true&w=majority&appName=Cluster0",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

async function clearDb() {
  await Promise.all([User.collection.drop().catch(() => {})]);
  await Promise.all([Project.collection.drop().catch(() => {})]);
  await Promise.all([Task.collection.drop().catch(() => {})]);
  await Promise.all([Tag.collection.drop().catch(() => {})]);
  console.log("Database cleared");
}

async function createUsers() {
  for (const user of users) {
    const passwordUser = await bcrypt.hash(user.password, 10);
    const userCreated = await User.create({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: passwordUser,
      roles: user.roles,
    });
    usersCreated.push(userCreated);
  }

  for (const manager of managers) {
    const passwordManager = await bcrypt.hash(manager.password, 10);
    const managerCreated = await User.create({
      firstname: manager.firstname,
      lastname: manager.lastname,
      email: manager.email,
      password: passwordManager,
      roles: manager.roles,
    });
    managersCreated.push(managerCreated);
  }

  return [...usersCreated, ...managersCreated];
}

async function createProjects() {
  for (const project of projects) {
    const projectCreated = await Project.create({
      title: project.title,
      description: project.description,
      startAt: project.startAt,
      endAt: project.endAt,
      owner: managersCreated[0]._id,
      members: [usersCreated[0]._id],
    });
    projectsCreated.push(projectCreated);
  }
  const projectIds = projectsCreated.map((project) => project._id);
  await User.updateOne(
    { _id: managersCreated[0]._id },
    { $push: { projectsOwned: { $each: projectIds } } }
  );
  await User.updateOne(
    { _id: usersCreated[0]._id },
    { $push: { projectsMemberOf: { $each: projectIds } } }
  );
}

async function createTasks() {
  for (const task of tasks) {
    const taskCreated = await Task.create({
      title: task.title,
      description: task.description,
      state: task.state,
      priority: task.priority,
      dueAt: task.dueAt,
      assignee: usersCreated[0]._id,
      project: projectsCreated[0]._id,
    });
    tasksCreated.push(taskCreated);
  }
  const taskIds = tasksCreated.map((task) => task._id);
  await Project.updateOne(
    { _id: projectsCreated[0]._id },
    { $push: { tasks: { $each: taskIds } } }
  );
  await User.updateOne(
    { _id: usersCreated[0]._id },
    { $push: { tasksAssigned: { $each: taskIds } } }
  );
}

async function createTags() {
  for (const tag of tags) {
    const tagCreated = await Tag.create({
      name: tag.name,
      project: projectsCreated[0]._id,
    });
    tagsCreated.push(tagCreated);
  }
  const tagIds = tagsCreated.map((task) => task._id);
  await Project.updateOne(
    { _id: projectsCreated[0]._id },
    { $push: { tags: { $each: tagIds } } }
  ); 
}

async function main() {
  try {
    await connect();
    await clearDb();
    await createUsers();
    await createProjects();
    await createTasks();
    await createTags();
    console.log("Seeding complete ✅");
  } catch (err) {
    console.error("Seeding error", err);
  } finally {
    await mongoose.disconnect();
    console.log("Mongo disconnected");
  }
}

main();

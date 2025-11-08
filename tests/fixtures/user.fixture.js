const { Types } = require("mongoose");
const Role = require("../../src/enum/role.enum");

const users = [
  {
    id: new Types.ObjectId(),
    email: "user1@test.com",
    password: "user1Test",
    firstname: "User",
    lastname: "One",
    roles: [Role.ROLE_USER],
  },
  {
    id: new Types.ObjectId(),
    email: "user2@test.com",
    password: "user2Test",
    firstname: "User",
    lastname: "Two",
    roles: [Role.ROLE_USER],
  },
  {
    id: new Types.ObjectId(),
    email: "user3@test.com",
    password: "user3Test",
    firstname: "User",
    lastname: "Three",
    roles: [Role.ROLE_USER],
  },
  {
    id: new Types.ObjectId(),
    email: "user4@test.com",
    password: "user4Test",
    firstname: "User",
    lastname: "Four",
    roles: [Role.ROLE_USER],
  }
];

const managers = [
  {
    id: new Types.ObjectId(),
    email: "manager1@test.com",
    password: "manager1Test",
    firstname: "Manager",
    lastname: "One",
    roles: [Role.ROLE_MANAGER],
  },
  {
    id: new Types.ObjectId(),
    email: "manager2@test.com",
    password: "manager2Test",
    firstname: "Manager",
    lastname: "Two",
    roles: [Role.ROLE_MANAGER],
  },
  {
    id: new Types.ObjectId(),
    email: "manager3@test.com",
    password: "manager3Test",
    firstname: "Manager",
    lastname: "Three",
    roles: [Role.ROLE_MANAGER],
  }
];

module.exports = { users, managers };

const request = require("supertest");

const app = require("../../src/app");
const Role = require("../../src/enum/role.enum");

describe("User Registration and Login", () => {
  it("should register a new user", async () => {
    const res = await createUser();
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("email");
  });

  it("should login an existing user", async () => {
    const password = "Password1";
    const user = await createUser(password);
    const res = await request(app)
        .post("/api/users/login")
        .send({
          email: user.body.email,
          password: password,
        });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });
});

async function createUser(password = "Password1") {
  return await request(app)
    .post("/api/users/register")
    .send({
      email: "user1@test.com",
      password: password,
      firstname: "User",
      lastname: "One",
      roles: [Role.ROLE_USER],
    });
}

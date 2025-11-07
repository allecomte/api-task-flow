const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("../src/models/user.model");
const { users, managers } = require("../tests/fixtures/user.fixture");

dotenv.config();

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
  console.log("Database cleared");
  // await mongoose.connection.db.dropDatabase();
  // console.log('Database cleared');
}

async function createUsers() {
  const usersCreated = [];
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
    usersCreated.push(managerCreated);
  }

  return usersCreated;
}

async function createProjects(
  
) {}

async function main() {
  try {
    await connect();
    await clearDb();
    await createUsers();
    console.log("Seeding complete ✅");
  } catch (err) {
    console.error("Seeding error", err);
  } finally {
    await mongoose.disconnect();
    console.log("Mongo disconnected");
  }
}

main();

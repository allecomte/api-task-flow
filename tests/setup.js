const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  process.env.JWT_SECRET = "jwt-secret-test";
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// afterEach(async () => {
//   const collections = mongoose.connection.collections;
//   for (const key in collections) {
//     await collections[key].deleteMany({});
//   }
// });

afterEach(async () => {
  // Ne pas nettoyer après chaque test si la variable SKIP_CLEANUP est définie
  if (process.env.SKIP_CLEANUP === "true") return;

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

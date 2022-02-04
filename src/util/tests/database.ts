import { MongoMemoryServer } from "mongodb-memory-server";
import { Db, MongoClient } from "mongodb";

export let connection: MongoClient;
export let mongoServer: MongoMemoryServer;
export let testDb: Db;

export const setupTestDb = async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_TESTING_URI = mongoServer.getUri();

  connection = await MongoClient.connect(mongoServer.getUri(), {});
  testDb = connection.db();
};

export const closeTestDb = async () => {
  await testDb.dropDatabase();
  await connection.close();
  await mongoServer.stop();
};

export const clearTestDb = async () => {
  const collections = await testDb.collections();
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

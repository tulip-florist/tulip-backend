const connectDB = require("./src/api/database/database").connectDB;
const logger = require("./src/util/logger").default;
const testDbUtil = require("./src/util/tests/database");

// Initial "setup" to be run ONCE BEFORE ALL test cases
beforeAll(async () => {
  logger.transports.forEach((t) => (t.silent = true)); // disable logging
  await testDbUtil.setupTestDb();
  await connectDB();
});

// Final "cleanup" to be run AFTER ALL test cases finished
afterAll(async () => {
  await testDbUtil.closeTestDb();
});

/** @type {import('@jest/types').Config.InitialOptions} */
const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  preset: "@shelf/jest-mongodb",
  transform: {
    ...tsjPreset.transform,
  },
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["./jest.setup.js"],
  testPathIgnorePatterns: ["<rootDir>/dist/"],
};

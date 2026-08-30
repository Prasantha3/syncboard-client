export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js"],
  reporters: [
    "default",
    [
      "jest-html-reporters",
      {
        publicPath: "./reporters",
        filename: "test-report.html",
        pageTitle: "SyncBoard Server Tests",
        openReport: false,
      },
    ],
  ],
};
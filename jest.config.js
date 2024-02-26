module.exports = {
  testEnvironment: "node",
  clearMocks: true,
  collectCoverageFrom: [
    "**/*.{js,jsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  coverageDirectory: "coverage",
  verbose: true,
};

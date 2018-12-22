const path = require("path");

const { fromRoot, resolveBin, ifHasAnyDependency } = require("../utils");

const jestConfig = {
  rootDir: fromRoot("src"), // A list of paths to directories that Jest should use to search for files in.
  transform: {
    ".(ts|tsx)": "ts-jest"
  } /* A map from regular expressions to paths to transformers. A transformer is a module that provides a synchronous function for transforming source files. */,
  testEnvironment: ifHasAnyDependency(["react", "webpack"], "jsdom", "node"), //The test environment that will be used for testing. The default environment in Jest is a browser-like environment through jsdom. If you are building a node service, you can use the node option to use a node-like environment instead.
  moduleFileExtensions: ["ts", "tsx", "js", "json"], // An array of file extensions your modules use. If you require modules without specifying a file extension, these are the extensions Jest will look for.
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$", // The pattern Jest uses to detect test files.
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }, // This will be used to configure minimum threshold enforcement for coverage results.
  collectCoverage: true, // Indicates whether the coverage information should be collected while executing the test.
  collectCoverageFrom: [
    "**/*.{js,ts}",
    "!**/node_modules/**",
    "!**/coverage/**"
  ], // An array of glob patterns indicating a set of files for which coverage information should be collected.
  globals: {
    "ts-jest": {
      tsConfig: path.resolve(__dirname, "./tsconfig.json")
    }
  }
};

module.exports = jestConfig;

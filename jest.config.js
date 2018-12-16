const originalJestConfig = require('./src/config/jest.config');

module.exports = {
  ...originalJestConfig,
  coverageThreshold: null,
};

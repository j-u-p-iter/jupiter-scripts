// 1. uses custom config from --config
// 2. uses custom config jest.config.js from project root
// 3. uses custom config from package.json
// 4. uses builtin config withou predefined config.
// 5. doesn't watch changes in ci
// 6. doesn't watch changes with coverage option.
// 7. watches changes in not ci environment without coverage option

jest.mock('jest', () => ({ run: jest.fn() }));

describe('test script', () => {
  let mockJestRun;
  let utils;
  let runScript;

  beforeEach(() => {
    jest.resetModules();

    ({ run: mockJestRun } = require('jest'));
    (utils = require('../../utils'));
    process.argv = [];

    runScript = () => require('../test');
  });

  it('uses custom config from --config', () => {
    const pathToCustomConfig = '/some-folder/jest.confgig.js';
    process.argv = ['node', '../test', '--config', pathToCustomConfig];

    runScript();

    const [[options]] = mockJestRun.mock.calls;

    expect(utils.parseArgs(options).config).toBe(pathToCustomConfig);
  });

  it('uses custom config jest.config.js from project root', () => {
    const hasFile = fileName => fileName === 'jest.config.js';

    Object.assign(utils, { hasFile });

    runScript();

    const [[options]] = mockJestRun.mock.calls;

    expect(utils.parseArgs(options).config).toBeUndefined();
  });
});

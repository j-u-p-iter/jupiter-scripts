jest.mock('jest', () => ({ run: jest.fn() }));

let isCI;
jest.mock('is-ci', () => isCI);

describe('test script', () => {
  let mockJestRun;
  let utils;
  let runScript;

  beforeEach(() => {
    jest.resetModules();

    ({ run: mockJestRun } = require('jest'));
    (utils = require('../../utils'));
    process.argv = [];
    isCI = false;

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

  it('uses custom config from package.json', () => {
    const hasPkgProp = propName => propName === 'jest';

    Object.assign(utils, { hasPkgProp });

    runScript();

    const [[options]] = mockJestRun.mock.calls;

    expect(utils.parseArgs(options).config).toBeUndefined();
  });

  it('uses builtin config without predefined configs', () => {
    const hasFile = fileName => fileName !== 'jest.config.js';
    const hasPkgProp = propName => propName !== 'jest';

    Object.assign(utils, { hasFile, hasPkgProp });

    runScript();

    const [[options]] = mockJestRun.mock.calls;

    expect(utils.parseArgs(options).config).toBe(utils.resolvePath(__dirname, '../../config/jest.config.js'));
  });

  it('does not watch changes in CI environment', () => {
    isCI = true;

    runScript();

    const [[options]] = mockJestRun.mock.calls;

    expect(utils.parseArgs(options).watch).toBeUndefined();
  });

  it('does not watch changes with coverage option', () => {
    process.argv = ['node', '../test', '--coverage'];

    runScript();

    const [[options]] = mockJestRun.mock.calls;

    expect(utils.parseArgs(options).watch).toBeUndefined();
  });

  it('. watches changes in not CI environment without coverage option', () => {
    runScript();

    const [[options]] = mockJestRun.mock.calls;

    expect(utils.parseArgs(options).watch).toBe(true);
  });
});

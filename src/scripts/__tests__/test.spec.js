const cases = require('jest-in-case');

jest.mock('jest', () => ({ run: jest.fn() }));

let isCI;
jest.mock('is-ci', () => isCI);

describe('test script', () => {
  let mockJestRun;
  let utils;
  let runScript;
  let setupTSConfig;

  beforeEach(() => {
    jest.resetModules();

    setupTSConfig = jest.fn();
    ({ run: mockJestRun } = require('jest'));
    (utils = require('../../utils'));
    process.argv = [];
    isCI = false;

    Object.assign(utils, { setupTSConfig });
    runScript = () => require('../test');
  });

  it('setup tsconfig', () => {
    runScript();

    expect(utils.setupTSConfig).toHaveBeenCalledTimes(1);
  });

  cases('uses config', ({
    doBefore,
    result,
  }) => {
    doBefore();

    runScript();

    const [[options]] = mockJestRun.mock.calls;

    expect(utils.parseArgs(options).config).toBe(typeof result === 'function' ? result() : result);
  }, {
    'from --config option': {
      doBefore: () => {
        process.argv = ['node', '../test', '--config', '/some-folder/jest.confgig.js'];
      },
      result: '/some-folder/jest.confgig.js',
    },
    'from project root': {
      doBefore: () => {
        const hasFile = fileName => fileName === 'jest.config.js';

        Object.assign(utils, { hasFile });
      },
      result: undefined,
    },
    'from package.json': {
      doBefore: () => {
        const hasPkgProp = propName => propName === 'jest';

        Object.assign(utils, { hasPkgProp });
      },
      result: undefined,
    },
    'builtin by default': {
      doBefore: () => {
        const hasFile = fileName => fileName !== 'jest.config.js';
        const hasPkgProp = propName => propName !== 'jest';

        Object.assign(utils, { hasFile, hasPkgProp });
      },
      result: () => utils.resolvePath(__dirname, '../../config/jest.config.js')
    }
  });

  cases('watch', ({
    doBefore = () => {},
    result,
  }) => {
    doBefore();

    runScript();

    const [[options]] = mockJestRun.mock.calls;

    expect(utils.parseArgs(options).watch).toBe(result);
  }, {
    'does not happen in CI': {
      doBefore: () => { isCI = true },
      result: undefined,
    },
    'does not happen with coverage option': {
      doBefore: () => {
        process.argv = ['node', '../test', '--coverage'];
      },
      result: undefined,
    },
    'happens in not CI environment without coverage option (by default)': {
      result: true,
    }
  })
});

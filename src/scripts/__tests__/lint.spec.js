// 1. tslint.json is required
// 2. setupTSConfig was called one time without args.
// 3. if no tslint config option and no tslint.json file we use builtinTSLintConfig
// 4. if no tsconfig and project option - we use builtin typescript config.
// 5. allowJS option should be filtered.
// 6. spawn.sync should be called with correct args.
// 7. if spawn.sync returns signal - handleSpawnSignal should be called with correct args.
// 8. if spawn.sync doesn't return signal - process.exit should be called with correct params.

const path = require('path');
const cases = require('jest-in-case');
const mockTslintJson = jest.fn();
jest.mock('../../config/tslint.json', () => mockTslintJson());

jest.mock('cross-spawn', () => ({ sync: jest.fn(() => ({})) }))

const runScript = () => require('../lint');

describe('lint script', () => {
  let setupTSConfig;
  let utils;
  let mockCrossSpawnSync;

  beforeEach(() => {
    jest.resetModules();

    ({ sync: mockCrossSpawnSync } = require('cross-spawn'));


    utils = require('../../utils');

    setupTSConfig = jest.fn();
    process.argv = [];
    process.exit = jest.fn();
    Object.assign(utils, { setupTSConfig });
  });


  it('requires tslint.json and setup tsconfig', () => {
    runScript();

    // we require config to include this config into result dist folder
    expect(mockTslintJson).toHaveBeenCalledTimes(1);
    expect(utils.setupTSConfig).toHaveBeenCalledTimes(1);
  });

  it('runs correct bin', () => {
    runScript();

    const [[script]] = mockCrossSpawnSync.mock.calls;

    expect(script).toBe(utils.resolveBin('tslint'));
  });

  it('filters out helper options', () => {
    process.argv = ['--allowJs'];

    runScript();

    const [[, configs]] = mockCrossSpawnSync.mock.calls;

    const allowJs = utils.parseArgs(configs).allowJs;

    expect(allowJs).toBeUndefined();
  });

  cases('without custom config', ({
    hasFile = () => false,
    optionName,
    configName,
  }) => {
    Object.assign(utils, { hasFile })

    runScript();

    const [[, options]] = mockCrossSpawnSync.mock.calls;

    const resultConfig = utils.parseArgs(options)[optionName];

    expect(resultConfig).toBe(path.resolve(__dirname, `../../config/${configName}`));
  }, {
    'tslint.json': { configName: 'tslint.json', optionName: 'config' },
    'tsconfig.json': { configName: 'tsconfig.json', optionName: 'project' },
  });

  cases('with predefined config', ({
    optionName,
    pathToConfig,
  }) => {
    process.argv = ['node', '../lint', `--${optionName}`, pathToConfig];

    runScript();

    const [[, options]] = mockCrossSpawnSync.mock.calls;

    const resultConfig = utils.parseArgs(options)[optionName];

    expect(resultConfig).toBe(pathToConfig);
  }, {
    'tslint.json': { pathToConfig: '/some-folder/tslint.json', optionName: 'config' },
    'tsconfig.json': { pathToConfig: '/some-folder/tsconfig.json', optionName: 'project' },
  });

  cases('with builtin config', ({
    hasFile,
    optionName,
  }) => {
    Object.assign(utils, { hasFile });

    runScript();

    const [[, options]] = mockCrossSpawnSync.mock.calls;

    const resultConfig = utils.parseArgs(options)[optionName];

    expect(resultConfig).toBeUndefined();
  }, {
    'tslint.json': { hasFile: fileName => fileName === 'tslint.json', optionName: 'config' },
    'tsconfig.json': { hasFile: fileName => fileName === 'tsconfig.json', optionName: 'project' },
  });
});

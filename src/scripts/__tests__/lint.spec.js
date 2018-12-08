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
  let utils = {};
  let mockCrossSpawnSync;
  let handleSpawnSignal;

  beforeEach(() => {
    jest.resetModules();

    ({ sync: mockCrossSpawnSync } = require('cross-spawn'));


    utils = require('../../utils');

    handleSpawnSignal = jest.fn();
    setupTSConfig = jest.fn();
    process.argv = [];
    process.exit = jest.fn();
    Object.assign(utils, { setupTSConfig, handleSpawnSignal });
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

  cases('processes result', ({
    result,
    calledMethod,
    argsCalledWith,
  }) => {
    mockCrossSpawnSync.mockReturnValue(result);

    runScript();

    expect(calledMethod()).toHaveBeenCalledTimes(1);
    expect(calledMethod()).toHaveBeenCalledWith(...argsCalledWith);
  }, {
    'calling handleSpawnSignal util when returned signal': {
      result: { signal: 'some-signal', status: 'some-status' },
      calledMethod: () => utils.handleSpawnSignal,
      argsCalledWith: ['lint', 'some-signal'],
    },
    'calling process.exit when signal was not returned': {
      result: { status: 'some-status' },
      calledMethod: () => process.exit,
      argsCalledWith: ['some-status']
    }
  })

  cases('uses builtin config', ({
    hasFile,
    optionName,
    configName,
  }) => {
    Object.assign(utils, { hasFile })

    runScript();

    const [[, options]] = mockCrossSpawnSync.mock.calls;

    const resultConfig = utils.parseArgs(options)[optionName];

    expect(resultConfig).toBe(path.resolve(__dirname, `../../config/${configName}`));
  }, {
    'without custom tslint.json': { configName: 'tslint.json', optionName: 'config', hasFile: fileName => fileName !== 'tslint.json' },
    'without custom tsconfig.json': { configName: 'tsconfig.json', optionName: 'project', hasFile: fileName => fileName !== 'tsconfig.json' },
  });

  cases('uses predefined config', ({
    optionName,
    pathToConfig,
  }) => {
    process.argv = ['node', '../lint', `--${optionName}`, pathToConfig];

    runScript();

    const [[, options]] = mockCrossSpawnSync.mock.calls;

    const resultConfig = utils.parseArgs(options)[optionName];

    expect(resultConfig).toBe(pathToConfig);
  }, {
    'with predefined --config tslint.json': { pathToConfig: '/some-folder/tslint.json', optionName: 'config' },
    'with predefined --project tsconfig.json': { pathToConfig: '/some-folder/tsconfig.json', optionName: 'project' },
  });

  cases('uses custom config', ({
    hasFile,
    optionName,
  }) => {
    Object.assign(utils, { hasFile });

    runScript();

    const [[, options]] = mockCrossSpawnSync.mock.calls;

    const resultConfig = utils.parseArgs(options)[optionName];

    expect(resultConfig).toBeUndefined();
  }, {
    'with custom tslint.json in project root': { hasFile: fileName => fileName === 'tslint.json', optionName: 'config' },
    'with custom tsconfig.json in project root': { hasFile: fileName => fileName === 'tsconfig.json', optionName: 'project' },
  });
});

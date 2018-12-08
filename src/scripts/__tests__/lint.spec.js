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

  describe('spawn.sync', () => {
    describe('script', () => {
      it('should be correct', () => {
        runScript();

        const [[script]] = mockCrossSpawnSync.mock.calls;

        expect(script).toBe(utils.resolveBin('tslint'));
      });
    });

    describe('config option', () => {
      describe('without --config option and without custom tslint.json file', () => {
        it('should be called with builtin config', () => {
          const hasFile = jest.fn(() => false)
          Object.assign(utils, { hasFile });

          runScript();

          const [[, configs]] = mockCrossSpawnSync.mock.calls;

          const resultConfig = utils.parseArgs(configs).config;

          expect(resultConfig).toBe(path.resolve(__dirname, '../../config/tslint.json'));
        });
      });

      describe('with --config option', () => {
        it('should be called with passed --config', () => {
          const pathToConfig = 'some-custom-config.json';
          process.argv = ['node', '../lint', '--config', pathToConfig];

          runScript();

          const [[, configs]] = mockCrossSpawnSync.mock.calls;

          const resultConfig = utils.parseArgs(configs).config;

          expect(resultConfig).toBe(pathToConfig);
        });
      });

      describe('with custom tslint.json file', () => {
        it('should be called without config option', () => {
          const hasFile = jest.fn(fileName => fileName === 'tslint.json')
          Object.assign(utils, { hasFile });

          runScript();

          const [[, configs]] = mockCrossSpawnSync.mock.calls;

          const resultConfig = utils.parseArgs(configs).config;

          expect(resultConfig).toBeUndefined();
        });
      });
    })

    describe('project option', () => {
      describe('without --project option and without custom tsconfig.json file', () => {
        it('should be called with builtin config', () => {
          const hasFile = jest.fn(() => false)
          Object.assign(utils, { hasFile });

          runScript();

          const [[, configs]] = mockCrossSpawnSync.mock.calls;

          const resultProject = utils.parseArgs(configs).project;

          expect(resultProject).toBe(path.resolve(__dirname, '../../config/tsconfig.json'));
        });
      });

      describe('with --project option', () => {
        it('should be called with passed --project', () => {
          const pathToConfig = 'some-custom-config.json';
          process.argv = ['node', '../lint', '--project', pathToConfig];

          runScript();

          const [[, configs]] = mockCrossSpawnSync.mock.calls;

          const resultProject = utils.parseArgs(configs).project;

          expect(resultProject).toBe(pathToConfig);
        });
      });

      describe('with custom tsconfig.json file', () => {
        it('should be called without config option', () => {
          const hasFile = jest.fn(fileName => fileName === 'tsconfig.json')
          Object.assign(utils, { hasFile });

          runScript();

          const [[, configs]] = mockCrossSpawnSync.mock.calls;

          const resultProject = utils.parseArgs(configs).project;

          expect(resultProject).toBeUndefined();
        });
      });
    });

    describe('allowJs option', () => {
      it('should be filtered out', () => {
        process.argv = ['--allowJs'];

        runScript();

        const [[, configs]] = mockCrossSpawnSync.mock.calls;

        const allowJs = utils.parseArgs(configs).allowJs;

        expect(allowJs).toBeUndefined();
      });
    });
  });
});

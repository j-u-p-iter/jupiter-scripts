// 1. tslint.json is required
// 2. setupTSConfig was called one time without args.
// 3. if no tslint config option and no tslint.json file we use builtinTSLintConfig
// 4. if no tsconfig and project option - we use builtin typescript config.
// 5. allowJS option should be filtered.
// 6. spawn.sync should be called with correct args.
// 7. if spawn.sync returns signal - handleSpawnSignal should be called with correct args.
// 8. if spawn.sync doesn't return signal - process.exit should be called with correct params.

const path = require('path');
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

  describe('tslint.json', () => {
    it('should be required', () => {
      runScript();

      // we require config to include this config into result dist folder
      expect(mockTslintJson).toHaveBeenCalledTimes(1);
    });
  });

  describe('setupTSConfig util', () => {
    it('should be called', () => {
      runScript();

      expect(utils.setupTSConfig).toHaveBeenCalledTimes(1);
    });
  });

  describe('spawn.sync', () => {
    describe('config option', () => {
      describe('without --config option and without custom tslint.json file', () => {
        it('should be called with builtin config', () => {
          const hasFile = jest.fn(() => false)
          Object.assign(utils, { hasFile });

          runScript();

          const [firstCall] = mockCrossSpawnSync.mock.calls;

          const [script, configs] = firstCall;
          const resultConfig = utils.parseArgs(configs).config;

          expect(script).toBe(utils.resolveBin('tslint'));
          expect(resultConfig).toBe(path.resolve(__dirname, '../../config/tslint.json'));
        });
      });

      describe('with --config option', () => {
        it('should be called with passed --config', () => {
          const pathToConfig = 'some-custom-config.json';
          process.argv = ['node', '../lint', '--config', pathToConfig];

          runScript();

          const [firstCall] = mockCrossSpawnSync.mock.calls;
          const [script, configs] = firstCall;

          const resultConfig = utils.parseArgs(configs).config;

          expect(script).toBe(utils.resolveBin('tslint'));
          expect(resultConfig).toBe(pathToConfig);
        });
      });

      describe('with custom tslint.json file', () => {
        it('should be called without config option', () => {
          const hasFile = jest.fn(fileName => fileName === 'tslint.json')
          Object.assign(utils, { hasFile });

          runScript();

          const [firstCall] = mockCrossSpawnSync.mock.calls;
          const [script, configs] = firstCall;

          const resultConfig = utils.parseArgs(configs).config;

          expect(script).toBe(utils.resolveBin('tslint'));
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

          const [firstCall] = mockCrossSpawnSync.mock.calls;

          const [script, configs] = firstCall;
          const resultProject = utils.parseArgs(configs).project;

          expect(script).toBe(utils.resolveBin('tslint'));
          expect(resultProject).toBe(path.resolve(__dirname, '../../config/tsconfig.json'));
        });
      });

      describe('with --project option', () => {
        it('should be called with passed --project', () => {
          const pathToConfig = 'some-custom-config.json';
          process.argv = ['node', '../lint', '--project', pathToConfig];

          runScript();

          const [firstCall] = mockCrossSpawnSync.mock.calls;
          const [script, configs] = firstCall;

          const resultProject = utils.parseArgs(configs).project;

          expect(script).toBe(utils.resolveBin('tslint'));
          expect(resultProject).toBe(pathToConfig);
        });
      });

      describe('with custom tsconfig.json file', () => {
        it('should be called without config option', () => {
          const hasFile = jest.fn(fileName => fileName === 'tsconfig.json')
          Object.assign(utils, { hasFile });

          runScript();

          const [firstCall] = mockCrossSpawnSync.mock.calls;
          const [script, configs] = firstCall;

          const resultProject = utils.parseArgs(configs).project;

          expect(script).toBe(utils.resolveBin('tslint'));
          expect(resultProject).toBeUndefined();
        });
      });
    });

    describe('allowJs option', () => {
      it('should be filtered out', () => {
        process.argv = ['--allowJs'];

        runScript();

        const [firstCall] = mockCrossSpawnSync.mock.calls;
        const [script, configs] = firstCall;

        const allowJs = utils.parseArgs(configs).allowJs;

        expect(script).toBe(utils.resolveBin('tslint'));
        expect(allowJs).toBeUndefined();
      });
    });
  });
});

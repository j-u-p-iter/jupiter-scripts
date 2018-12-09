// 4. uses config:
//   - from --config option
//   - from project root
//   - builtin by default
//
// 5. filters out `allowJs, cli and bundle options`
//
// 6. formats
//   - by default
//   - with predefined formats
//

// 7. runs script individually for each format
//
// 8. scrips
//    - contains BUILD_FORMAT env variable
//    - contains BUILD_MINIFY env variable
//    - contains BUILD_CLI env variable

const cases = require("jest-in-case");

jest.mock("cross-spawn", () => ({ sync: jest.fn(() => ({})) }));
jest.mock("rimraf", () => ({ sync: jest.fn() }));

const runScript = () => require("../build/rollup");

describe("rollup script", () => {
  let setupTSConfig;
  let handleSpawnSignal;
  let mockCrossSpawnSync;
  let mockRimrafSync;
  let utils;

  beforeEach(() => {
    jest.resetModules();

    utils = require("../../utils");

    ({ sync: mockCrossSpawnSync } = require("cross-spawn"));
    ({ sync: mockRimrafSync } = require("rimraf"));

    setupTSConfig = jest.fn();
    handleSpawnSignal = jest.fn();
    process.exit = jest.fn();
    process.argv = ["node", "../build/rollup", "--bundle"];

    Object.assign(utils, { setupTSConfig, handleSpawnSignal });
  });

  it("setups tsconfig and removes dist folder", () => {
    runScript();

    // setups tsconfig.json
    expect(utils.setupTSConfig).toHaveBeenCalledTimes(1);

    // removes root dist folder
    expect(mockRimrafSync).toHaveBeenCalledTimes(1);
    expect(mockRimrafSync).toHaveBeenCalledWith(utils.fromRoot("dist"));
  });

  it("doesn`t remove dist folder with --no-clean", () => {
    process.argv = [...process.argv, "--no-clean"];

    runScript();

    expect(mockRimrafSync).toHaveBeenCalledTimes(0);
  });

  it("runs correct bin", () => {
    runScript();

    const [[script]] = mockCrossSpawnSync.mock.calls;

    expect(script).toBe(utils.resolveBin("concurrently"));
  });

  cases(
    "uses config",
    ({ doBefore = () => {}, result, shouldContain = true }) => {
      doBefore();

      runScript();

      const [[, scripts]] = mockCrossSpawnSync.mock.calls;

      const expected = typeof result === "function" ? result() : result;

      expect(scripts.join(" ")).toEqual(
        shouldContain
          ? expect.stringContaining(expected)
          : expect.not.stringContaining(expected)
      );
    },
    {
      "from --config": {
        doBefore: () => {
          process.argv = [
            ...process.argv,
            "--config",
            "/some-folder/rollup.config.js"
          ];
        },
        result: "--config /some-folder/rollup.config.js"
      },
      "from project root": {
        doBefore: () => {
          const hasFile = fileName => fileName === "rollup.config.js";

          Object.assign(utils, { hasFile });
        },
        shouldContain: false,
        result: "--config"
      },
      "builtin by default": {
        doBefore: () => {
          const hasFile = fileName => fileName !== "rollup.config.js";

          Object.assign(utils, { hasFile });
        },
        result: () =>
          `--config ${utils.resolvePath(
            __dirname,
            "../../config/rollup.config.js"
          )}`
      }
    }
  );
});

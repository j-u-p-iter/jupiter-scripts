const cases = require("jest-in-case");

const mockTsConfigJson = jest.fn();
jest.mock("../../config/tsconfig.json", () => mockTsConfigJson());

jest.mock("cross-spawn", () => ({ sync: jest.fn(() => ({})) }));
jest.mock("rimraf", () => ({ sync: jest.fn() }));

const runScript = () => require("../build/tsc");

describe("tsc script", () => {
  let handleSpawnSignal;
  let setupTSConfig;
  let utils;
  let mockCrossSpawnSync;
  let mockRimrafSync;

  beforeEach(() => {
    jest.resetModules();

    ({ sync: mockCrossSpawnSync } = require("cross-spawn"));
    ({ sync: mockRimrafSync } = require("rimraf"));

    utils = require("../../utils");

    handleSpawnSignal = jest.fn();
    setupTSConfig = jest.fn();
    process.argv = [];
    process.exit = jest.fn();
    Object.assign(utils, { setupTSConfig, handleSpawnSignal });
  });

  // we require config to include this config into result dist folder
  it("requires tsconfig.json, setups tsconfig.json and removes root dist folder", () => {
    runScript();

    // requires tsconfig.json
    expect(mockTsConfigJson).toHaveBeenCalledTimes(1);

    // setups tsconfig.json
    expect(utils.setupTSConfig).toHaveBeenCalledTimes(1);

    // removes root dist folder
    expect(mockRimrafSync).toHaveBeenCalledTimes(1);
    expect(mockRimrafSync).toHaveBeenCalledWith(utils.fromRoot('dist'));
  });

  it("runs correct bin", () => {
    runScript();

    const [[script]] = mockCrossSpawnSync.mock.calls;

    expect(script).toBe(utils.resolveBin("tsc"));
  });

  cases(
    "doesn`t setup tsconfig",
    ({ doBefore = () => {} }) => {
      doBefore();

      runScript();

      expect(utils.setupTSConfig).toHaveBeenCalledTimes(0);
    },
    {
      "with -p option": {
        doBefore: () => {
          process.argv = ["node", "../build/tsc", "-p"];
        }
      },
      "with --project option": {
        doBefore: () => {
          process.argv = ["node", "../build/tsc", "--project"];
        }
      },
      "with tsconfig.json file in the root of the project": {
        doBefore: () => {
          const hasFile = fileName => fileName === "tsconfig.json";

          Object.assign(utils, { hasFile });
        }
      }
    }
  );

  cases(
    "processes result",
    ({ result, calledMethod, argsCalledWith }) => {
      mockCrossSpawnSync.mockReturnValue(result);

      runScript();

      expect(calledMethod()).toHaveBeenCalledTimes(1);
      expect(calledMethod()).toHaveBeenCalledWith(...argsCalledWith);
    },
    {
      "calling handleSpawnSignal when signal was returned": {
        result: { signal: "some-signal", status: "some-status" },
        calledMethod: () => utils.handleSpawnSignal,
        argsCalledWith: ["tsc build", "some-signal"]
      },
      "calling process.exit when signal was not returned": {
        result: { status: "some-status" },
        calledMethod: () => process.exit,
        argsCalledWith: ["some-status"]
      }
    }
  );

  cases(
    "uses config",
    ({ doBefore = () => {}, result, optionName }) => {
      doBefore();

      runScript();

      const [[, options]] = mockCrossSpawnSync.mock.calls;

      expect(utils.parseArgs(options)[optionName]).toBe(
        typeof result === "function" ? result() : result
      );
    },
    {
      "from -p option": {
        doBefore: () => {
          process.argv = [
            "node",
            "../build/tsc",
            "-p",
            "/some-folder/tsconfig.json"
          ];
        },
        result: "/some-folder/tsconfig.json",
        optionName: "p"
      },
      "from --project option": {
        doBefore: () => {
          process.argv = [
            "node",
            "../build/tsc",
            "--project",
            "/some-folder/tsconfig.json"
          ];
        },
        result: "/some-folder/tsconfig.json",
        optionName: "project"
      },
      "from root of the project": {
        doBefore: () => {
          const hasFile = fileName => fileName === "tsconfig.json";

          Object.assign(utils, { hasFile });
        },
        result: undefined,
        optionName: "project"
      },
      "builtin by default": {
        result: () =>
          utils.resolvePath(__dirname, "../../config/tsconfig.json"),
        optionName: "project"
      }
    }
  );
});

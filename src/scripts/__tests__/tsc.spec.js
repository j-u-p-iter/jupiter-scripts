const cases = require("jest-in-case");

const mockTsConfigJson = jest.fn();
jest.mock("../../config/tsconfig.json", () => mockTsConfigJson());

jest.mock("cross-spawn", () => ({ sync: jest.fn(() => ({})) }));

const runScript = () => require("../build/tsc");

describe("tsc script", () => {
  let handleSpawnSignal;
  let setupTSConfig;
  let utils;
  let mockCrossSpawnSync;

  beforeEach(() => {
    jest.resetModules();

    ({ sync: mockCrossSpawnSync } = require("cross-spawn"));

    utils = require("../../utils");

    handleSpawnSignal = jest.fn();
    setupTSConfig = jest.fn();
    process.argv = [];
    process.exit = jest.fn();
    Object.assign(utils, { setupTSConfig, handleSpawnSignal });
  });

  it("requires tsconfig.json and setups tsconfig.json", () => {
    runScript();

    // we require config to include this config into result dist folder
    expect(mockTsConfigJson).toHaveBeenCalledTimes(1);
    expect(utils.setupTSConfig).toHaveBeenCalledTimes(1);
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

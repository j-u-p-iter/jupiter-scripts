// to include tsconfig.json into dist folder
// resolveJsonModule in tslint.json should be enabled
require("../config/tslint.json");

const path = require("path");
const spawn = require("cross-spawn");
const yargsParser = require("yargs-parser");

const { hasFile, resolveBin } = require("../utils");

const args = process.argv.slice(2);

const useBuiltinConfig = !args.includes("--config") && !hasFile("tslint.json");

const pathToConfig = useBuiltinConfig
  ? [
      "--project",
      path.resolve(__dirname, "../config/tsconfig.json"),
      "--config",
      path.resolve(__dirname, "../config/tslint.json")
    ]
  : [];

const { signal, status: statusResult } = spawn.sync(
  resolveBin("tslint"),
  [...pathToConfig, ...args],
  { stdio: "inherit" }
);

if (signal) {
  handleSpawnSignal("tslint", signal);
} else {
  process.exit(statusResult);
}

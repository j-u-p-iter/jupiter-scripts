// to include tsconfig.json into dist folder
// resolveJsonModule in tslint.json should be enabled
require("../config/tslint.json");

const path = require("path");
const spawn = require("cross-spawn");
const yargsParser = require("yargs-parser");

const { hasFile, resolveBin, setupTSConfig } = require("../utils");

const args = process.argv.slice(2);
const parsedArgs = yargsParser(args);

setupTSConfig(true);

const useBuiltinLintConfig =
  !args.includes("--config") && !hasFile("tslint.json");

const pathToConfig = useBuiltinLintConfig
  ? [
      "--project",
      path.resolve(__dirname, "../config/tsconfig.json"),
      "--config",
      path.resolve(__dirname, "../config/tslint.json")
    ]
  : [];

let options = [];

if (parsedArgs.fix) {
  options.push("--fix");
}

if (parsedArgs.format) {
  options = [...options, "--format", parsedArgs.format];
}

const { signal, status: statusResult } = spawn.sync(
  resolveBin("tslint"),
  [...pathToConfig, ...options],
  { stdio: "inherit" }
);

if (signal) {
  handleSpawnSignal("tslint", signal);
} else {
  process.exit(statusResult);
}

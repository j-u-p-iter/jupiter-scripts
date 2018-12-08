// to include tsconfig.json into dist folder
// resolveJsonModule in tslint.json should be enabled
require("../config/tslint.json");

const path = require("path");
const spawn = require("cross-spawn");
const yargsParser = require("yargs-parser");

const { hasFile, resolveBin, setupTSConfig, filterArgs } = require("../utils");

const args = process.argv.slice(2);

setupTSConfig();

const useBuiltinTSLintConfig =
  !args.includes("--config") && !hasFile("tslint.json");

const useBuiltinTSConfig =
  !args.includes("--project") && !hasFile("tsconfig.json");

const pathToTSLintConfig = useBuiltinTSLintConfig
  ? ["--config", path.resolve(__dirname, "../config/tslint.json")]
  : [];

const pathToTSConfig = useBuiltinTSConfig
  ? ["--project", path.resolve(__dirname, "../config/tsconfig.json")]
  : [];

const { signal, status: statusResult } = spawn.sync(
  resolveBin("tslint"),
  [...pathToTSLintConfig, ...pathToTSConfig, ...filterArgs(args, ["allowJs"])],
  { stdio: "inherit" }
);

if (signal) {
  handleSpawnSignal("tslint", signal);
} else {
  process.exit(statusResult);
}

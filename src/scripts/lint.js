// to include tsconfig.json into dist folder
// resolveJsonModule in tslint.json should be enabled
require("../config/tslint.json");

const spawn = require("cross-spawn");

const {
  hasFile,
  resolveBin,
  setupTSConfig,
  filterArgs,
  handleSpawnSignal,
  resolvePath
} = require("../utils");

const args = process.argv.slice(2);

setupTSConfig();

const useBuiltinTSLintConfig =
  !args.includes("--config") && !hasFile("tslint.json");

const useBuiltinTSConfig =
  !args.includes("--project") && !hasFile("tsconfig.json");

const pathToTSLintConfig = useBuiltinTSLintConfig
  ? ["--config", resolvePath(__dirname, "../config/tslint.json")]
  : [];

const pathToTSConfig = useBuiltinTSConfig
  ? ["--project", resolvePath(__dirname, "../config/tsconfig.json")]
  : [];

const { signal, status: statusResult } = spawn.sync(
  resolveBin("tslint"),
  [
    ...pathToTSLintConfig,
    ...pathToTSConfig,
    ...filterArgs(args, ["allowJs"])
  ],
  { stdio: "inherit" }
);

if (signal) {
  handleSpawnSignal("lint", signal);
} else {
  process.exit(statusResult);
}

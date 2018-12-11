const spawn = require("cross-spawn");

const {
  hasFile,
  hasPkgProp,
  resolveBin,
  resolvePath,
  filterArgs,
  setupTSConfig,
} = require("../utils");

const args = process.argv.slice(2);

setupTSConfig();

const useBuiltInConfig =
  !args.includes("--config") &&
  !args.includes("-c") &&
  !hasFile(".lintstagedrc") &&
  !hasFile("lint-staged.config.js") &&
  !hasPkgProp("lint-staged");

const pathToLintStagedConfig = useBuiltInConfig
  ? ["--config", resolvePath(__dirname, "../config/lint-staged.config.js")]
  : [];

const { signal, status: statusResult } = spawn.sync(
  resolveBin("lint-staged"),
  [...pathToLintStagedConfig, ...filterArgs(args, ["allowJs"])],
  { stdio: "inherit" }
);

if (signal) {
  handleSpawnSignal("lint-staged", signal);
} else {
  process.exit(statusResult);
}

const spawn = require("cross-spawn");

const {
  hasFile,
  hasPkgProp,
  resolveBin,
  resolvePath,
  filterArgs,
  setupTSConfig,
  resolveJupiterScripts,
  handleSpawnSignal
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

const { error, status, signal } = spawn.sync(
  resolveBin("lint-staged"),
  [...pathToLintStagedConfig, ...filterArgs(args, ["allowJs"])],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      ALLOW_JS: args.includes("--allowJs")
    }
  }
);

if (signal) {
  handleSpawnSignal("lint-staged", signal);
} else {
  spawn.sync(
    `${resolveJupiterScripts()}`,
    ["validate", ...filterArgs(args, ["allowJs"])],
    { stdio: "inherit", env: process.env }
  );

  spawn.sync(
    `${resolveJupiterScripts()}`,
    ["commit", ...filterArgs(args, ["allowJs"])],
    { stdio: "inherit" }
  );
}

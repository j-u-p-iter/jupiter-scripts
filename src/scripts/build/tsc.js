// to include tsconfig.json into dist folder
// resolveJsonModule in tsconfig.json should be enabled
require("../../config/tsconfig.json");

const spawn = require("cross-spawn");
const rimraf = require("rimraf");

const {
  hasFile,
  fromRoot,
  resolveBin,
  handleSpawnSignal,
  getPathToBuiltinTSConfig,
  setupTSConfig,
  resolvePath,
  filterArgs
} = require("../../utils");

const args = process.argv.slice(2);
const here = p => resolvePath(__dirname, p);

// So, there're several ways to set configs for typescript bin:

// through CLI
// with tsconfig.json

// If we find one of this way in current project/module we we'll use this typescript configs
// instead of builtin
const useBuiltinTSConfig =
  !args.includes("-p") &&
  !args.includes("--project") &&
  !hasFile("tsconfig.json");

if (useBuiltinTSConfig) {
  setupTSConfig();
}

const tsconfig = useBuiltinTSConfig
  ? ["--project", getPathToBuiltinTSConfig()]
  : [];

rimraf.sync(fromRoot("dist"));

const { signal, status: statusResult } = spawn.sync(
  resolveBin("tsc"),
  [...tsconfig, ...filterArgs(args, ["allowJs", "cli"])],
  { stdio: "inherit" }
);

if (signal) {
  handleSpawnSignal("tsc build", signal);
} else {
  process.exit(statusResult);
}

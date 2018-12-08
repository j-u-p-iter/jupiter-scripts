// to include tsconfig.json into dist folder
// resolveJsonModule in tsconfig.json should be enabled
require("../../config/tsconfig.json");

const path = require("path");
const spawn = require("cross-spawn");
const rimraf = require("rimraf");

const {
  hasFile,
  hasPkgProp,
  fromRoot,
  resolveBin,
  handleSpawnSignal,
  getPathToBuiltinTSConfig,
  setupTSConfig
} = require("../../utils");

const args = process.argv.slice(2);
const here = p => path.join(__dirname, p);

// So, there're several ways to set configs for babel bin:

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
  [...tsconfig],
  { stdio: "inherit" }
);

if (signal) {
  handleSpawnSignal("build", signal);
} else {
  process.exit(statusResult);
}

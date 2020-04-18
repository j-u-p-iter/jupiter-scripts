const spawn = require("cross-spawn");
const yargsParser = require("yargs-parser");
const rimraf = require("rimraf");

const {
  handleSpawnSignal,
  resolveBin,
  hasFile,
  fromRoot,
  setupTSConfig,
  filterArgs,
  resolvePath,
  arrayToString
} = require("../../utils");

const pathToRollupBin = resolveBin("rollup");
const args = process.argv.slice(2);
const parsedArgs = yargsParser(args);
const here = (...props) => resolvePath(__dirname, ...props);

const formats =
  typeof parsedArgs.bundle === "string"
    ? parsedArgs.bundle.split(",").map(format => format.trim())
    : ["esm", "cjs", "umd.min"];

const cleanBundleDir = !args.includes("--no-clean");

if (cleanBundleDir) {
  rimraf.sync(fromRoot("dist"));
}

const buildCLI = args.includes("--cli");

setupTSConfig();

const useBuiltinRollupConfig =
  !args.includes("--config") && !hasFile("rollup.config.js");

// ## Options we pass to bin start

// set up builtin config or don't setup --config option
// in this case package config will be used
const config = useBuiltinRollupConfig
  ? `--config ${here("../../config/rollup.config.js")}`
  : "";

const rollupOptions = [
  config,
  ...filterArgs(args, ["allowJs", "cli", "bundle"])
];

// ## Options we pass to bin end
const getScript = env =>
  arrayToString([env, pathToRollupBin, ...rollupOptions]);

const getScripts = () =>
  formats.map(format => {
    const [formatName, minify = false] = format.split(".");
    const buildMinify = Boolean(minify);
    const env = [
      `BUILD_FORMAT=${formatName}`,
      `BUILD_MINIFY=${buildMinify}`,
      `BUILD_CLI=${buildCLI}`
    ].join(" ");

    return getScript(env);
  });

const { signal, status: statusResult } = spawn.sync(
  resolveBin("concurrently"),
  getScripts(),
  { stdio: "inherit" }
);

if (signal) {
  handleSpawnSignal("rollup", signal);
} else {
  process.exit(statusResult);
}

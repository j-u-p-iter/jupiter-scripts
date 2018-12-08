const path = require("path");
const spawn = require("cross-spawn");
const yargsParser = require("yargs-parser");
const rimraf = require("rimraf");
const editJsonFile = require("edit-json-file");

const {
  handleSpawnSignal,
  resolveBin,
  hasFile,
  fromRoot,
  setupTSConfig
} = require("../../utils");

const pathToRollupBin = resolveBin("rollup");
const args = process.argv.slice(2);
const { bundle, watch: parsedWatch, outDir, include, allowJs } = yargsParser(
  args
);
const here = (...props) => path.join(__dirname, ...props);

const formats =
  typeof bundle === "string"
    ? bundle.split(",").map(format => format.trim())
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

const watch = parsedWatch ? "--watch" : "";

const rollupOptions = [config, watch];

// ## Options we pass to bin end

const getScript = env =>
  [env, pathToRollupBin, ...rollupOptions].filter(Boolean).join(" ");

const getScripts = () =>
  formats.map(format => {
    const [formatName, minify = false] = format.split(".");
    const sourceMap = formatName === "umd" ? "--sourcemap" : "";
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

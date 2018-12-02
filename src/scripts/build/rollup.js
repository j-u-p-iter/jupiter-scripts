const path = require("path");
const spawn = require("cross-spawn");
const yargsParser = require("yargs-parser");
const rimraf = require("rimraf");
const editJsonFile = require("edit-json-file");

const {
  handleSpawnSignal,
  resolveBin,
  hasFile,
  fromRoot
} = require("../../utils");

const TYPESCRIPT_CONFIG_NAME = "tsconfig.json";
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

const useBuiltInTypeScriptConfig = !hasFile(TYPESCRIPT_CONFIG_NAME);

const pathToTsConfig = useBuiltInTypeScriptConfig
  ? path.resolve(__dirname, `../../config/${TYPESCRIPT_CONFIG_NAME}`)
  : fromRoot(TYPESCRIPT_CONFIG_NAME);

if (useBuiltInTypeScriptConfig) {
  const tsConfig = editJsonFile(pathToTsConfig);

  tsConfig.set("compilerOptions.allowJs", allowJs);
  tsConfig.set("compilerOptions.declaration", !allowJs);

  if (allowJs) {
    tsConfig.unset("compilerOptions.declarationDir");
  } else {
    tsConfig.set(
      "compilerOptions.declarationDir",
      outDir ? `${outDir}/types` : fromRoot("dist/types")
    );
  }

  tsConfig.set("compilerOptions.outDir", outDir || fromRoot("dist/lib"));
  tsConfig.set("include", include ? [include] : [fromRoot("src")]);
  tsConfig.save();
}

const useBuiltinConfig =
  !args.includes("--config") && !hasFile("rollup.config.js");

// ## Options we pass to bin start

// set up builtin config or don't setup --config option
// in this case package config will be used
const config = useBuiltinConfig
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
      `BUILD_CLI=${buildCLI}`,
      `PATH_TO_TS_CONFIG=${pathToTsConfig}`
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

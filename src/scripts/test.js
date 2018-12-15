const isCI = require("is-ci");
const jest = require("jest");

const {
  hasFile,
  hasPkgProp,
  resolvePath,
  filterArgs,
  setupTSConfig,
  arrayToString
} = require("../utils");

console.log('## Test Script ##');

const here = (...props) => resolvePath(__dirname, ...props);

const args = process.argv.slice(2);

setupTSConfig();

// ## Options we pass to bin start
const isCoverage = args.includes("--coverage");
const noWatch = args.includes("--noWatch");
const watch = !isCI && !isCoverage && !noWatch ? "--watch" : "";

const useBuiltinConfig =
  !args.includes("--config") &&
  !hasFile("jest.config.js") &&
  !hasPkgProp("jest");

const config = useBuiltinConfig
  ? `--config ${here("../config/jest.config.js")}`
  : "";

const jestOptions = arrayToString([
  config,
  watch,
  ...filterArgs(args, ["allowJs", "noWatch"])
]);
// ## Options we pass to bin end

console.log(jestOptions);

jest.run(jestOptions);

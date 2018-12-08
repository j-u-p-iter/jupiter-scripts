const isCI = require("is-ci");
const jest = require("jest");

const { hasFile, hasPkgProp, resolvePath } = require("../utils");

const here = (...props) => resolvePath(__dirname, ...props);

const args = process.argv.slice(2);

const isCoverage = args.includes("--coverage");
const useBuiltinConfig =
  !args.includes("--config") &&
  !hasFile("jest.config.js") &&
  !hasPkgProp("jest");

// ## Options we pass to bin start
const watch = !isCI && !isCoverage ? "--watch" : "";

const config = useBuiltinConfig
  ? `--config ${here("../config/jest.config.js")}`
  : "";

const jestOptions = [config, watch, ...args].filter(Boolean).join(" ");
// ## Options we pass to bin end

jest.run(jestOptions);

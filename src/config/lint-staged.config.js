const { resolveJupiterScripts, arrayToString, parseEnv } = require("../utils");

const jupiterScripts = resolveJupiterScripts();

const ALLOW_JS = parseEnv("ALLOW_JS", false);

const testScriptOptions = arrayToString([
  ALLOW_JS && "--allowJs",
  "--noWatch",
  "--findRelatedTests",
  "--passWithNoTests"
]);
const lintScriptOptions = arrayToString([ALLOW_JS && "--allowJs", "--fix"]);

const lintStagedConfig = {
  concurrent: false,
  linters: {
    "**/*.+(css|json|js|ts|tsx)": [
      `${jupiterScripts} lint ${lintScriptOptions}`,
      `${jupiterScripts} test ${testScriptOptions}`,
      "git add"
    ]
  }
};

module.exports = lintStagedConfig;

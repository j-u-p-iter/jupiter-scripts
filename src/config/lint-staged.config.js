const { resolveJupiterScripts, arrayToString } = require("../utils");

const jupiterScripts = resolveJupiterScripts();

const allowJs = process.argv.includes("--allowJs");
const testScriptOptions = arrayToString([
  "--allowJs",
  "--noWatch",
  "--findRelatedTests",
  "--passWithNoTests"
]);
const lintScriptOptions = arrayToString(["--allowJs", "--fix"]);

const lintStagedConfig = {
  concurrent: false,
  linters: {
    "**/*.+(js|json|css|ts|tsx)": [
      `${jupiterScripts} lint ${lintScriptOptions}`,
      `${jupiterScripts} test ${testScriptOptions}`,
      "git add"
    ]
  }
};

module.exports = lintStagedConfig;

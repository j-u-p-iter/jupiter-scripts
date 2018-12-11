const { resolveJupiterScripts } = require('../utils');

const jupiterScripts = resolveJupiterScripts();

const lintStagedConfig = {
  concurrent: false,
  linters: {
    '**/*.+(js|json|css|ts|tsx)': [
      `${jupiterScripts} lint`,
      `${jupiterScripts} test --findRelatedTests --passWithNoTests`,
    ]
  }
}

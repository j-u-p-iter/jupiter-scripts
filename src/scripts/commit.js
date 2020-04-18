const bootstrap = require("commitizen/dist/cli/git-cz").bootstrap;

const { resolveModulePath } = require("../utils");

bootstrap({
  cliPath: resolveModulePath("commitizen"),
  config: {
    path: "cz-conventional-changelog"
  }
});

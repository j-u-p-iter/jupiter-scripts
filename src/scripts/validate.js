const spawn = require("cross-spawn");

const {
  parseEnv,
  resolveBin,
  getConcurrentlyArgs,
  ifTrue
} = require("../utils");

const notPrecommitScript = !parseEnv("SCRIPTS_PRECOMMIT", false);

const validationScripts = {
  build: "yarn run build",
  lint: ifTrue(notPrecommitScript, "yarn run lint"),
  test: ifTrue(
    notPrecommitScript,
    "yarn run test --noWatch --silent --coverage --no-cache"
  )
};

const { signal, status } = spawn.sync(
  resolveBin("concurrently"),
  getConcurrentlyArgs(validationScripts),
  { stdio: "inherit", env: process.env }
);

if (signal) {
  handleSpawnSignal("validate", signal);
} else {
  process.exit(status);
}

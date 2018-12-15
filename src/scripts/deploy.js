const spawn = require("cross-spawn");

const { resolveBin } = require("../utils");

const { status } = spawn.sync(
  resolveBin("concurrently"),
  [
    `echo installing coveralls && npx -p coveralls@3 -c 'echo running coveralls && coveralls'`,
    `echo installing semantic-release && npx -p semantic-release@15 -c 'echo running semantic-release && semantic-release'`
  ],
  { stdio: "inherit" }
);

process.exit(status);

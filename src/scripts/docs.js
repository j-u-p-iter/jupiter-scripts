const spawn = require("cross-spawn");

const { resolveBin, packageData, fromRoot } = require("../utils");

const pathToSourceFile = fromRoot(packageData.module);

const { status, output } = spawn.sync(
  resolveBin("jsdoc2md"),
  ["--files", pathToSourceFile],
  { stdio: "inherit" }
);

process.exit(status);

const path = require("path");
const spawn = require("cross-spawn");
const glob = require("glob");
const yargs = require("yargs");

const { handleSpawnSignal } = require("./utils");

// executor - programm, that run our binary (npx, node, ts-node). Binary, that starts another binary.
// bin - name (jupiter-scripts) or path (lib (node lib)) of/to our binary
// scriptName - name of script we want to execute with our binary)
// args - array of arguments, that should be passed to script we try to run with binary
//
// So, executor runs binary, binary runs script
const [executor, bin, scriptName, ...args] = process.argv;

/* tslint:disable:no-unused-expression */
yargs
  .usage("$0 [commands] [--flags]")
  .command("build", "build module")
  .command("test", "run tests")
  .command("lint", "lint code")
  .demandCommand(1, "Available commands: ...")
  .help().argv;

function spawnScript() {
  const relativeScriptPath = path.join(__dirname, "scripts", scriptName);
  // by default it search for index.js
  // if there's package.json, path will be generated to the file
  // in main package.json key
  const mainScriptPath = attemptToResolve(relativeScriptPath);

  if (!mainScriptPath) {
    throw new Error(`Unknown script "${scriptName}"`);
  }

  const { signal, status } = spawn.sync(executor, [mainScriptPath, ...args], {
    stdio: "inherit",
    env: {
      ...process.env,
      [`SCRIPTS_${scriptName.toUpperCase()}`]: true
    }
  });

  if (signal) {
    handleSpawnSignal(scriptName, signal);
  } else {
    process.exit(status);
  }
}

function attemptToResolve(moduleName) {
  try {
    return require.resolve(moduleName);
  } catch (error) {
    return null;
  }
}

const runScript = () => {
  if (scriptName) {
    spawnScript();
  } else {
    const scriptsPath = path.join(__dirname, "scripts/");
    const availableScripts = glob.sync(path.join(__dirname, "scripts", "*"));

    const availableScriptsMessage = availableScripts
      .map(script =>
        script
          .replace("__tests__", "")
          .replace(scriptsPath, "")
          .replace(".ts", "")
      )
      .filter(Boolean)
      .join("\n ");

    const fullMessage = `
  Usage: ${bin} [script] [--flags]

  Available Scripts:
  ${availableScriptsMessage}
    `;

    console.log(fullMessage);

    process.exit(0);
  }
};

module.exports = {
  runScript
};

export {};

// Key moments happens there:
// - find package.json file of the current module/project with read-pkg-up
// - detect directory of this package.json with path.dirname
// - all actions we'll do further depends on the this path - path of the current module package
// - what actions I'm talking about:
//   - find module/project config file (for example, .babelrc)

const fs = require("fs");
const path = require("path");
const readPkgUp = require("read-pkg-up");
const arrify = require("arrify");
const { has, curry, get, keys, isArray } = require("lodash");
const which = require("which");
const yargsParser = require("yargs-parser");
const editJsonFile = require("edit-json-file");
const { mapKeys, flatten } = require("lodash");

const { TYPESCRIPT_CONFIG_NAME } = require("../config/common");

const POSSIBLE_MODULES_FORMATS = ["main", "module", "umd:main"];

const { pkg: packageData, path: pkgPath } = readPkgUp.sync();

const parseArgs = argumentsToParse => yargsParser(argumentsToParse);
const resolvePath = (...paths) => path.resolve(...paths);

const resolveJupiterScripts = () =>
  packageData.name === "@j.u.p.iter/jupiter-scripts"
    ? require.resolve("../").replace(process.cwd(), ".")
    : resolveBin("@j.u.p.iter/jupiter-scripts", {
        executable: "jupiter-scripts"
      });

const arrayToString = array => array.filter(Boolean).join(" ");

const modulesFormats = modulesToBuild =>
  pick(packageData, POSSIBLE_MODULES_FORMATS).map(
    scriptName => scriptName.split(".").reverse()[1]
  );

const getModuleName = (moduleFormat, minify) =>
  `${packageData.name.replace("@j.u.p.iter/", "")}.${moduleFormat}${
    minify ? ".min.js" : ".js"
  }`;

const getModulePath = (moduleFormat, minify) =>
  `dist/lib/${getModuleName(moduleFormat, minify)}`;

const appDirectory = path.dirname(pkgPath);

const fromRoot = (...p) => path.join(appDirectory, ...p);

const hasFile = (...p) => fs.existsSync(fromRoot(...p));

const hasPkgProp = props => arrify(props).some(prop => has(packageData, prop));

const hasPkgSubProp = curry((pkgProp, subProps) =>
  hasPkgProp(arrify(subProps).map(subProp => `${pkgProp}.${subProp}`))
);

const ifHasPkgSubProp = pkgProp => (subProps, resultOnTrue, resultOnFalse) =>
  hasPkgSubProp(pkgProp, subProps) ? resultOnTrue : resultOnFalse;

const hasScript = hasPkgSubProp("scripts");

const hasPeerDependency = hasPkgSubProp("peerDependencies");
const hasDependency = hasPkgSubProp("dependencies");
const hasDevelopmentDependency = hasPkgSubProp("devDependencies");
const hasAnyDependency = dependencies =>
  [hasPeerDependency, hasDependency, hasDevelopmentDependency].some(method =>
    method(dependencies)
  );

const ifHasAnyDependency = (dependencies, resultOnTrue, resultOnFalse) =>
  hasAnyDependency(dependencies) ? resultOnTrue : resultOnFalse;

const parseEnv = (name, defaultEnvValue) => {
  if (isEnvSet(name)) {
    try {
      return JSON.parse(process.env[name]);
    } catch (error) {
      return process.env[name];
    }
  }

  return defaultEnvValue;
};

const isEnvSet = name => {
  return (
    process.env.hasOwnProperty(name) &&
    process.env[name] &&
    process.env[name] !== "undefined"
  );
};

const withDefault = curry((defaultValue, data) => {
  let notEmpty = !!data;

  if (isArray(data)) {
    notEmpty = !!data.length;
  }

  return notEmpty ? data : defaultValue;
});

const withObjectByDefault = withDefault({});

// For umd we need to have dependencies included in bundle,
// Cause we don't have the ability to install dependencies
// With npm and package.json for such modules
const generateExternals = moduleFormat =>
  moduleFormat === "umd"
    ? withObjectByDefault(keys(get(packageData, "peerDependencies")))
    : withObjectByDefault(
        keys(get(packageData, "dependencies")).concat(
          keys(get(packageData, "peerDependencies"))
        )
      );

const resolveBin = (moduleName, { executable = moduleName } = {}) => {
  let pathToBinFoundWithWhich;

  try {
    pathToBinFoundWithWhich = which.sync(executable);
  } catch (error) {
    // should stay empty
  }

  try {
    // if no such package, error will be thrown
    // in this case we go to catch section
    // and return the path, that was found with which
    const modulePackagePath = require.resolve(`${moduleName}/package.json`);
    const moduleRootDirectoryPath = path.dirname(modulePackagePath);
    const { bin: binKeyValue } = require(modulePackagePath);
    const binPath =
      typeof binKeyValue === "string" ? binKeyValue : binKeyValue[executable];
    const fullBinPath = path.join(moduleRootDirectoryPath, binPath);

    if (fullBinPath === pathToBinFoundWithWhich) {
      // it means, that bin will be found using short executable name
      // cause it was found with which
      return executable;
    }

    return fullBinPath;
  } catch (error) {
    if (pathToBinFoundWithWhich) {
      return executable;
    }

    throw error;
  }
};

const handleSpawnSignal = (scriptName, signal) => {
  if (signal === "SIGKILL") {
    console.log(
      `The script "${scriptName}" failed because the process exited too early. ` +
        "This probably means the system ran out of memory or someone called " +
        "`kill -9` on the process."
    );
  } else if (signal === "SIGTERM") {
    console.log(
      `The script "${scriptName}" failed because the process exited too early. ` +
        "Someone might have called `kill` or `killall`, or the system could " +
        "be shutting down."
    );
  }

  process.exit(1);
};

const hasTSConfig = () => hasFile("tsconfig.json");

const getPathToTSConfig = () =>
  hasTSConfig() ? fromRoot(TYPESCRIPT_CONFIG_NAME) : getPathToBuiltinTSConfig();

const getPathToBuiltinTSConfig = () =>
  path.resolve(__dirname, `../config/${TYPESCRIPT_CONFIG_NAME}`);

// we setup (only if project doesn't have it's own config in the root foler):
// - declaration dirs paths
// - include paths
// - outDir paths
// - allowJs flag
const setupTSConfig = () => {
  if (hasTSConfig()) {
    return;
  }

  const { allowJs } = yargsParser(process.argv.slice(2));
  const pathToConfig = path.resolve(__dirname, "../config/tsconfig.json");

  const config = editJsonFile(pathToConfig);

  config.set("compilerOptions.allowJs", allowJs);
  config.set("compilerOptions.declaration", !allowJs);

  if (allowJs) {
    config.unset("compilerOptions.declarationDir");
  } else {
    config.set("compilerOptions.declarationDir", fromRoot("dist/types"));
  }

  config.set("compilerOptions.outDir", fromRoot("dist/lib"));
  config.set("include", [fromRoot("src")]);
  config.save();
};

const filterBoolean = item => typeof item !== "boolean";

const filterArgs = (args, filterFrom) => {
  const parsedArgs = yargsParser(args);

  return flatten(
    Object.entries(parsedArgs)
      .filter(
        ([optionName, optionValue]) =>
          !["_", ...filterFrom].includes(optionName)
      )
      .map(([optionName, optionValue]) => [`--${optionName}`, optionValue])
  ).filter(filterBoolean);
};

module.exports = {
  appDirectory,
  parseEnv,
  ifHasAnyDependency,
  handleSpawnSignal,
  resolveBin,
  hasFile,
  hasPkgProp,
  fromRoot,
  packageData,
  getModuleName,
  getModulePath,
  generateExternals,
  setupTSConfig,
  getPathToBuiltinTSConfig,
  getPathToTSConfig,
  filterArgs,
  parseArgs,
  resolvePath,
  arrayToString,
  resolveJupiterScripts
};

// Key moments happens there:
// - find package.json file of the current module/project with read-pkg-up
// - detect directory of this package.json with path.dirname
// - all actions we'll do further depends on the this path - path of the current module package
// - what actions I'm talking about:
//   - find module/project config file (for example, .babelrc)

const fs = require('fs')
const path = require('path')
const readPkgUp = require('read-pkg-up')
const arrify = require('arrify')
const { has, curry, pick, keys, isArray } = require('lodash')
const which = require('which')

const POSSIBLE_MODULES_FORMATS = ['main', 'module', 'umd:main'];


const { pkg: packageData, path: pkgPath } = readPkgUp.sync()

const modulesFormats = (modulesToBuild: string[]) =>
  pick(packageData, POSSIBLE_MODULES_FORMATS).map((scriptName: string) => scriptName.split('.').reverse()[1]);

const getModuleName = (moduleFormat: string, minify: boolean = true) => `jupiter-scripts.${moduleFormat}${minify ? '.min.js': '.js'}`;

const getModulePath = (moduleFormat: string, minify: boolean = true) => `dist/lib/${getModuleName(moduleFormat)}`

const appDirectory = path.dirname(pkgPath)

const fromRoot = (...p: string[]) => path.join(appDirectory, ...p)

const hasFile = (...p: string[]) => fs.existsSync(fromRoot(...p))

const hasPkgProp = (props: string[] | string) => arrify(props).some((prop: string) => has(packageData, prop))

const hasPkgSubProp = curry(
  (pkgProp: string, subProps: string[]) =>
    hasPkgProp(arrify(subProps).map((subProp: string) => `${pkgProp}.${subProp}`))
)

const ifHasPkgSubProp = (pkgProp: string) => (subProps: string[], resultOnTrue: any, resultOnFalse: any) =>
  hasPkgSubProp(pkgProp, subProps) ? resultOnTrue : resultOnFalse

const hasScript = hasPkgSubProp('scripts')

const hasPeerDependency = hasPkgSubProp('peerDependencies')
const hasDependency = hasPkgSubProp('dependencies')
const hasDevelopmentDependency = hasPkgSubProp('devDependencies')
const hasAnyDependency = (dependencies: string[]) => [
  hasPeerDependency,
  hasDependency,
  hasDevelopmentDependency,
].some(method => method(dependencies))

const ifHasAnyDependency = (dependencies: string[], resultOnTrue: any, resultOnFalse: any) =>
  hasAnyDependency(dependencies) ? resultOnTrue : resultOnFalse

const parseEnv = (name: string, defaultEnvValue: string): any => {
  if (isEnvSet(name)) {
    try {
      return JSON.parse(process.env[name]!)
    } catch(error) {
      return process.env[name]
    }
  }

  return defaultEnvValue
}

const isEnvSet = (name: string) => {
  return (
    process.env.hasOwnProperty(name) &&
    process.env[name] &&
    process.env[name] !== 'undefined'
  )
}

const withDefault = curry((defaultValue: any, data: any) => {
  let notEmpty = !!data;

  if (isArray(data)) { notEmpty = !!data.length }

  return notEmpty ? data : defaultValue;
});

const withObjectByDefault = withDefault({});

// For umd we need to have dependencies included in bundle,
// Cause we don't have the ability to install dependencies
// With npm and package.json for such modules
const generateExternals = (moduleFormat: string) => (
  moduleFormat === 'umd'
    ? withObjectByDefault(
        keys(
          pick(packageData, 'peerDependencies')
        )
      )
    : withObjectByDefault(
        keys(
          keys(pick(packageData, 'dependencies')).concat(
            pick(packageData, 'peerDependencies')
          )
        )
      )
);

const resolveBin = (moduleName: string, { executable = moduleName } = {}) => {
  let pathToBinFoundWithWhich;

  try {
    pathToBinFoundWithWhich = which.sync(executable)
  } catch(error) {}

  try {
    // if no such package, error will be thrown
    // in this case we go to catch section
    // and return the path, that was found with which
    const modulePackagePath = require.resolve(`${moduleName}/package.json`)
    const moduleRootDirectoryPath = path.dirname(modulePackagePath)
    const { bin: binKeyValue } = require(modulePackagePath)
    const binPath = typeof binKeyValue === 'string' ? binKeyValue : binKeyValue[executable]
    const fullBinPath = path.join(moduleRootDirectoryPath, binPath)

    if (fullBinPath === pathToBinFoundWithWhich) {
      // it means, that bin will be found using short executable name
      // cause it was found with which
      return executable;
    }

    console.log(fullBinPath)
    return fullBinPath
  } catch(error) {
    if (pathToBinFoundWithWhich) {
      return executable
    }

    throw error
  }
}

const handleSpawnSignal = (scriptName: string, signal: string) => {
  if (signal === 'SIGKILL') {
    console.log(
      `The script "${scriptName}" failed because the process exited too early. ` +
        'This probably means the system ran out of memory or someone called ' +
        '`kill -9` on the process.',
    )
  } else if (signal === 'SIGTERM') {
    console.log(
      `The script "${scriptName}" failed because the process exited too early. ` +
        'Someone might have called `kill` or `killall`, or the system could ' +
        'be shutting down.',
    )
  }

  process.exit(1)
}


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
};

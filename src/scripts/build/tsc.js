// to include tsconfig.json into dist folder
// resolveJsonModule in tsconfig.json should be enabled
require('../../config/tsconfig.json')

const path = require('path')
const spawn = require('cross-spawn')
const rimraf = require('rimraf')
const yargsParser = require('yargs-parser')
const editJsonFile = require('edit-json-file');

const {
  hasFile,
  hasPkgProp,
  fromRoot,
  resolveBin,
  handleSpawnSignal,
} = require('../../utils')

const args = process.argv.slice(2)
const { outDir, include, allowJs } = yargsParser(args)
const here = p => path.join(__dirname, p);

// So, there're several ways to set configs for babel bin:

// through CLI
// with tsconfig.json

// If we find one of this way in current project/module we we'll use this typescript configs
// instead of builtin
const useBuiltinConfig =
  !args.includes('-p') && !args.includes('--project') && !hasFile('tsconfig.json');

const pathToConfig = path.resolve(__dirname, '../../config/tsconfig.json');

if (useBuiltinConfig) {
  const config = editJsonFile(pathToConfig);

  config.set('compilerOptions.allowJs', allowJs);
  config.set('compilerOptions.declaration', !allowJs);

  if (allowJs) {
    config.unset('compilerOptions.declarationDir')
  } else {
    config.set('compilerOptions.declarationDir', outDir ? `${outDir}/types` : fromRoot('dist/types'))
  }

  config.set('compilerOptions.outDir', outDir ? `${outDir}/lib` : fromRoot('dist/lib'))
  config.set('include', include ? [include] : [fromRoot('src')])
  config.save()
}

const tsconfig = useBuiltinConfig ? ['--project', pathToConfig] : [];

rimraf.sync(fromRoot('dist'));


const { signal, status: statusResult } = spawn.sync(
  resolveBin('tsc'),
  [ ...tsconfig ],
  { stdio: 'inherit' },
);

if (signal) {
  handleSpawnSignal('build', signal);
} else {
  process.exit(statusResult);
}

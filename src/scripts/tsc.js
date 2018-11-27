const path = require('path')
const spawn = require('cross-spawn')
const rimraf = require('rimraf')

const {
  hasFile,
  hasPkgProp,
  fromRoot,
  resolveBin,
  handleSpawnSignal,
} = require('../utils')

const args = process.argv.slice(2);
const here = p => path.join(__dirname, p);

// So, there're several ways to set configs for babel bin:

// through CLI
// with tsconfig.json

// If we find one of this way in current project/module we we'll use this typescript configs
// instead of builtin
const useBuiltinConfig =
  !args.includes('-p') && !args.includes('--project') && !hasFile('tsconfig.json');

const tsconfig = useBuiltinConfig ? ['--project', here('../../config/tsconfig.json')] : [];

const { signal, status: statusResult } = spawn.sync(
  resolveBin('tsc'),
  [ ...tsconfig ],
  { stdio: 'inherit' },
);

handleSpawnSignal(signal);

process.exit(statusResult);

const path = require('path')
const spawn = require('cross-spawn')
const rimraf = require('rimraf')

const {
  hasFile,
  hasPkgProp,
  fromRoot,
  resolveBin,
  handleSpawnSignal,
} = require('../../utils')

const args = process.argv.slice(2)
const here = p => path.join(__dirname, p)

// So, there're several ways to set configs for babel bin:
// - through CLI
// - with .babelrc
// - with package.json babel section
// If we find one of this way in current project/module we we'll use this babel settings
// instead of builtin
const useBuiltinConfig =
  !args.includes('--presets') && !hasFile('.babelrc') && !hasPkgProp('babel')
const config = useBuiltinConfig ? ['--presets', here('../../config/babelrc')] : []

const ignoreSpecifiedStuff = args.includes('--ignore')
const ignore = ignoreSpecifiedStuff ? [] : ['--ignore', '__tests__']

// option "--no-copy-files" does not present in babel
// it's purpose it to be able to setup --copy-files by default
// and at the same time to be able to disable it if it's required
const shouldNotCopyFiles = args.includes('--no-copy-files')
const copyFiles = shouldNotCopyFiles ? [] : ['--copy-files']

const useSpecifiedOutDir = args.includes('--out-dir')
const outDir = useSpecifiedOutDir ? [] : ['--out-dir', 'dist']

const shouldNotCleanOutDir = args.includes('--no-clean')
if (!useSpecifiedOutDir && !shouldNotCleanOutDir) {
  rimraf.sync(fromRoot('dist'))
}

const { signal, status } = spawn.sync(
  resolveBin('babel-cli', { executable: 'babel' }),
  [...outDir, ...copyFiles, ...ignore, ...config, 'lib'].concat(args),
  { stdio: 'inherit' },
)

handleSpawnSignal(signal)

process.exit(status)

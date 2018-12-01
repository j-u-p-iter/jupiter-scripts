const path = require('path')
const spawn = require('cross-spawn')
const yargsParser = require('yargs-parser')
const rimraf = require('rimraf')

const { handleSpawnSignal, resolveBin, hasFile, fromRoot } = require('../../utils')

const pathToRollupBin = resolveBin('rollup')
const args = process.argv.slice(2)
const parsedArgs = yargsParser(args)
const here = (...props) => path.join(__dirname, ...props)

const formats = typeof parsedArgs.bundle === 'string'
  ? parsedArgs.bundle.split(',').map(format => format.trim())
  : ['esm', 'cjs', 'umd.min'];

const cleanBundleDir = !args.includes('--no-clean')
if (cleanBundleDir) {
  rimraf.sync(fromRoot('dist'))
}

const buildCLI = args.includes('--cli');

const useBuiltinConfig = !args.includes('--config') && !hasFile('rollup.config.js')

// set up builtin config or don't setup --config option
// in this case package config will be used
const config = useBuiltinConfig ? `--config ${here('../../config/rollup.config.js')}` : ''

const getScript = env => [env, pathToRollupBin, config].filter(Boolean).join(' ')

const getScripts = () => (
  formats.map(format => {
    const [formatName, minify = false] = format.split('.')
    const sourceMap = formatName === 'umd' ? '--sourcemap' : ''
    const buildMinify = Boolean(minify)
    const env = [
      `BUILD_FORMAT=${formatName}`,
      `BUILD_MINIFY=${buildMinify}`,
      `BUILD_CLI=${buildCLI}`
    ].join(' ')

    return getScript(env)
  })
);

const { signal, statusResult } = spawn.sync(
  resolveBin('concurrently'),
  getScripts(),
  { stdio: 'inherit'},
)

handleSpawnSignal(signal)

process.exit(statusResult)

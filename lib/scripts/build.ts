const path = require('path')
const spawn = require('cross-spawn')
const yargsParser = require('yargs-parser')
const rimraf = require('rimraf')

const { handleSpawnSignal, resolveBin, hasFile, fromRoot } = require('../utils')

const pathToRollupBin = resolveBin('rollup')
const args = process.argv.slice(2)
const parsedArgs = yargsParser(args)
const here = (...props: string[]) => path.join(__dirname, ...props)

let formats = ['esm', 'cjs', 'umd']

if (typeof parsedArgs.build === 'string') {
  formats = parsedArgs.build.split(',')
}

const cleanBundleDir = !args.includes('--no-clean')

if (cleanBundleDir) {
  rimraf.sync(fromRoot('dist'))
}

const useBuiltinConfig = !args.includes('--config') && !hasFile('rollup.config.js')

// set up builtin config or don't setup --config option
// in this case package config will be used
const config = useBuiltinConfig ? `--config ${here('../config/rollup.config.ts')}` : ''

const getScript = (env: string) => {
  return [env, pathToRollupBin, config].filter(Boolean).join(' ')
}

const getScripts = () => {
  return formats.map(format => {
    const [formatName, minify = false] = format.split('.')
    const sourceMap = formatName === 'umd' ? '--sourcemap' : ''
    const buildMinify = Boolean(minify)
    const env = [
      `BUILD_FORMAT=${formatName}`,
      `BUILD_MINIFY=${buildMinify}`,
    ].join(' ')

    return getScript(env)
  })
}

const { signal, statusResult } = spawn.sync(
  resolveBin('concurrently'),
  getScripts(),
  { stdio: 'inherit'},
)

handleSpawnSignal(signal)

process.exit(statusResult)

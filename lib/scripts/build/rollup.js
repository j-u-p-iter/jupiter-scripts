const spawn = require('cross-spawn')
const yargsParser = require('yargs-parser')

const { handleSpawnSignal } = require('../../utils')


const args = process.argv.slice(2)
const parsedArgs = yargsParser(args)

let formats = ['es', 'cjs', 'umd', 'umd.min']

if (typeof parsedArgs.build === 'string') {
  formats = parsedArgs.build.split(',')
}


const getScript = () => {

}

const getScripts = () => {
  return formats.map(format => {
    const [formatName, minify = false] = format.split('.')
    const sourceMap = formatName === 'umd' ? '--sourcemap' : ''
    const buildMinify = Boolean(minify)
    const env = [
      `BUILD_FORMAT=${formatName}`,
      `BUILD_MINIFY=${buildMinify}`,
      'BUILD_ROLLUP=true'
    ].join(' ')

    return getScript(env, sourceMap)
  })
}

const { signal, status } = spawn.sync(require.resolve('concurrently'), getScripts(), {
  stdio: 'inherit',
})

handleSpawnSignal(signal)

process.exit(status)

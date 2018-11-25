const path = require('path')
const spawn = require('cross-spawn')
const glob = require('glob')

const { handleSpawnSignal } = require('./utils')

// executor - programm, that run our binary (npx, node, ts-node). Binary, that starts another binary.
// bin - name (jupiter-scripts) or path (lib (node lib)) of/to our binary
// scriptName - name of script we want to execute with our binary)
// args - array of arguments, that should be passed to script we try to run with binary
//
// So, executor runs binary, binary runs script
const [executor, bin, scriptName, ...args] = process.argv


function spawnScript() {
  const relativeScriptPath = path.join(__dirname, 'scripts', scriptName)
  // by default it search for index.js
  // if there's package.json, path will be generated to the file
  // in main package.json key
  const mainScriptPath = attemptToResolve(relativeScriptPath)

  if (!mainScriptPath) {
    throw new Error(`Unknown script "${scriptName}"`)
  }

  const { signal, status } = spawn.sync('ts-node', [mainScriptPath, ...args], {
    stdio: 'inherit',
  })

  if (signal) {
    handleSpawnSignal(scriptName, signal)
  } else {
    process.exit(status)
  }
}

function attemptToResolve(path: string) {
  try {
    return require.resolve(path)
  } catch(error) {
    return null;
  }
}

export const runScript = () => {
  if (scriptName) {
    spawnScript()
  } else {
    const scriptsPath = path.join(__dirname, 'scripts/')
    const availableScripts: string[] = glob.sync(path.join(__dirname, 'scripts', '*'))

    const availableScriptsMessage = availableScripts
      .map(
        script => script
          .replace('__tests__', '')
          .replace(scriptsPath, '')
      )
      .filter(Boolean)
      .join('\n ')

    const fullMessage = `
  Usage: ${bin} [script] [--flags]

  Available Scripts:
  ${availableScriptsMessage}
    `

    console.log(fullMessage)

    process.exit(0)
  }
}

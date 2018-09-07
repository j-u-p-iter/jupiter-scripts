const path = require('path')
const spawn = require('cross-spawn')
const glob = require('glob')

// executor - programm, that run our binary (npx, node)
// bin - name (jupiter-scripts) or path (lib (node lib)) of/to our binary
// scriptName - name of script we want to execute with our binary)
// args - array of arguments, that should be passed to script we try to run with binary
//
// So, executor runs binary, binary runs script
const [executor, bin, scriptName, ...args] = process.argv

if (scriptName) {
  spawnScript()
} else {
  const scriptsPath = path.join(__dirname, 'scripts/')
  const availableScripts = glob.sync(path.join(__dirname, 'scripts', '*'))

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

function spawnScript() {
  const relativeScriptPath = path.join(__dirname, 'scripts', scriptName)
  // by default it search for index.js
  // if there's package.json, path will be generated to the file
  // in main package.json key
  const mainScriptPath = attemptToResolve(relativeScriptPath)

  if (!mainScriptPath) {
    throw new Error(`Unknown script "${scriptName}"`)
  }

  const { signal, status } = spawn.sync(bin, [mainScriptPath, ...args], {
    stdio: 'inherit',
  })

  if (signal) {
    handleSignal(signal)
  } else {
    process.exit(status)
  }
}

function handleSignal(signal) {
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

function attemptToResolve(path) {
  try {
    require.resolve(path)
  } catch(error) {
    return null;
  }
}

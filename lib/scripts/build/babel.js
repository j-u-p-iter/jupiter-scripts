const path = require('path')
const spawn = require('cross-spawn')

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

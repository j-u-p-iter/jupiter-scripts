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
const { has } = require('lodash')

const { pkg, path: pkgPath } = readPkgUp.sync()

const appDirectory = path.dirname(pkgPath)

const fromRoot = (...p) => path.join(appDirectory, ...p)

const hasFile = (...p) => fs.existsSync(fromRoot(...p))

const hasPkgProp = props => arrify(props).some(prop => has(pkg, prop))

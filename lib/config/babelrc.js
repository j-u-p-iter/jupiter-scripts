const browserslist = require('browserslist')

const { ifHasAnyDependency, parseEnv, appDirectory } = require('../utils')


const isRollup = parseEnv('BUILD_ROLLUP', false)

const browsersConfig = browserslist.loadConfig({ path: appDirectory }) || [
  'ie10',
  'ios 7',
]

const envTargets = isRollup ? { browsers: browsersConfig } : { node: '8.10' }
const envOptions = { modules: false, loose: true, targets: envTargets }

const babelConfig = () => ({
  presets: [
    ['@babel/preset-env', envOptions],
    ifHasAnyDependency('react', ['@babel/preset-react'])
  ].filter(Boolean),
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-export-default-from'
  ]
})


module.exports = babelConfig;

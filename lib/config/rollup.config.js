const path = require('path')
const rollupBabel = require('rollup-plugin-babel')

const { parseEnv, packageData, hasFile, hasPkgProp } = require('../utils')


const buildMinify = parseEnv('BUILD_MINIFY', false)
const format = process.env.BUILD_FORMAT
const useBuiltInBabelPresets = !hasFile('.babelrc') && !hasPkgProp('babel')

const babelPresets = useBuiltInBabelPresets ? [require('./babelrc')()] : []

const fileName = [
  packageData.name,
  `.${format}`,
  buildMinify ? '.min' : null,
  '.js',
]
  .filter(Boolean)
  .join('')

const output = {
  file: path.join('dist', fileName),
  format,
}

module.exports = {
  input: 'lib/index.js',
  output,
  plugins: [
    rollupBabel({
      exclude: 'node_modules/**',
      presets: babelPresets,
      babelrc: true,
    }),
  ],
}

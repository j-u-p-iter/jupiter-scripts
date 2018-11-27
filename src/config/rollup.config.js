const path = require('path')
const rollupTypeScript = require('rollup-plugin-typescript2')
const rollupCommonJS = require('rollup-plugin-commonjs')
const rollupNodeResolve = require('rollup-plugin-node-resolve')
const rollupJSON = require('rollup-plugin-json');
const rollupNodeBuiltins = require('rollup-plugin-node-builtins');

const {
  parseEnv,
  hasFile,
  fromRoot,
  getModuleName,
  getModulePath,
  generateExternals,
} = require('../utils');

const TYPESCRIPT_CONFIG_NAME = 'tsconfig.json'

const buildMinify = parseEnv('BUILD_MINIFY', false)
const buildFormat = parseEnv('BUILD_FORMAT', false)

const useBuiltInTypeScriptConfig = !hasFile(TYPESCRIPT_CONFIG_NAME)

const pathToTsConfig = useBuiltInTypeScriptConfig ? `./src/config/${TYPESCRIPT_CONFIG_NAME}` : fromRoot(TYPESCRIPT_CONFIG_NAME)

const generateOutput = () =>({
  file: getModulePath(buildFormat, buildMinify),
  format: buildFormat,
  // name key is mandatory for umd modules
  // not to make things complicated - we add
  // this key for modules of all formats
  name: getModuleName(buildFormat, buildMinify),
  banner: '#!/usr/bin/env node',
});

module.exports = {
  input: 'src/index.js',
  output: generateOutput(),
  external: generateExternals(),
  plugins: [
    rollupJSON(),
    rollupTypeScript({
      tsconfig: pathToTsConfig,
    }),
    rollupCommonJS(),
    rollupNodeResolve(),
    rollupNodeBuiltins(),
  ],
}

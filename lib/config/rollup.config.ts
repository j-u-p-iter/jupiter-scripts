const path = require('path')
const rollupTypeScript = require('rollup-plugin-typescript2')

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
const buildFormat = parseEnv('BUILD_FORMAT', false);

const useBuiltInTypeScriptConfig = !hasFile(TYPESCRIPT_CONFIG_NAME)

const pathToTsConfig = useBuiltInTypeScriptConfig ? `./${TYPESCRIPT_CONFIG_NAME}` : fromRoot(TYPESCRIPT_CONFIG_NAME)

const generateOutput = () =>({
  file: getModulePath(buildFormat, buildMinify),
  format: buildFormat,
  // name key is mandatory for umd modules
  // not to make things complicated - we add
  // this key for modules of all formats
  name: getModuleName(buildFormat, buildMinify),
  banner: '#!/usr/bin/env ts-node',
});

module.exports = {
  input: 'lib/index.ts',
  output: generateOutput(),
  external: generateExternals(),
  plugins: [
    rollupTypeScript({
      tsconfig: pathToTsConfig,
    }),
  ],
}

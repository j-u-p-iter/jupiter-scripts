const rollupTypeScript = require("rollup-plugin-typescript2");
const rollupCommonJS = require("rollup-plugin-commonjs");
const rollupNodeResolve = require("rollup-plugin-node-resolve");
const rollupJSON = require("rollup-plugin-json");
const rollupNodeBuiltins = require("rollup-plugin-node-builtins");
const tempDir = require("temp-dir");

const {
  parseEnv,
  getModuleName,
  getModulePath,
  generateExternals,
  getPathToTSConfig
} = require("../utils");

const buildMinify = parseEnv("BUILD_MINIFY", false);
const buildFormat = parseEnv("BUILD_FORMAT", false);
const buildCLI = parseEnv("BUILD_CLI", false);

const generateOutput = () => ({
  file: getModulePath(buildFormat, buildMinify),
  format: buildFormat,
  // name key is mandatory for umd modules
  // not to make things complicated - we add
  // this key for modules of all formats
  name: getModuleName(buildFormat, buildMinify),
  banner: buildCLI ? "#!/usr/bin/env node" : ""
});

module.exports = {
  input: "src/index.ts",
  output: generateOutput(),
  external: generateExternals(),
  plugins: [
    rollupJSON(),
    rollupTypeScript({
      tsconfig: getPathToTSConfig(),
      // https://github.com/developit/microbundle/issues/169
      // https://github.com/developit/microbundle/pull/204
      // https://github.com/ezolenko/rollup-plugin-typescript2 ctrl+f `cacheRoot`
      cacheRoot: `${tempDir}/.rts2_cache_${buildFormat}`,
      exclude: ["**/__tests__/*"],
      useTsconfigDeclarationDir: true
    }),
    rollupCommonJS(),
    rollupNodeResolve(),
    rollupNodeBuiltins()
  ]
};

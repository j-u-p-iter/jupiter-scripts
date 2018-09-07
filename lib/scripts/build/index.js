if (process.argv.includes('--build')) {
  require('./rollup')
} else {
  require('./babel')
}

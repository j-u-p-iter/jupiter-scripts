process.argv.includes('--bundle') ? require('./rollup') : require('./babel')

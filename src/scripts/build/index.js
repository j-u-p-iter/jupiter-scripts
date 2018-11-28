// TypeScript doesn't create bundle, it transpiles files and copy them by default.
// So, we can use word 'build' to devide these two processes.
process.argv.includes('--bundle') ? require('./rollup') : require('./tsc');

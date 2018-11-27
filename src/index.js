const { checkNodeVersion } = require('./node-version-middleware');
const { runScript } = require('./script-runner');

checkNodeVersion();
runScript();

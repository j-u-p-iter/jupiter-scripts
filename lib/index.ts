import * as checkNodeVersion from './node-version-middleware';
import * as runScript from './script-runner';

checkNodeVersion.checkNodeVersion();
runScript.runScript();

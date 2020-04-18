// if developer run scripts inside scripts repo
// he needs node version >= 8, cause we don't run
// not bundled scripts
const fs = require("fs");

const MINOR_SUPPORTED_NODE_VERSION = 8;

const checkNodeVersion = () => {
  const isScriptRanInOriginalPackage = () => {
    const pathToPackageJSON = `${process.cwd()}/package.json`;
    if (fs.existsSync(pathToPackageJSON)) {
      const packageInfo = require(pathToPackageJSON);

      return packageInfo.name === "@j.u.p.iter/scripts";
    }

    return false;
  };

  const isIncorrectNodeVersion = () => {
    const nodeVersion = process.version[1];

    return Number(nodeVersion) < MINOR_SUPPORTED_NODE_VERSION;
  };

  if (isScriptRanInOriginalPackage() && isIncorrectNodeVersion()) {
    throw new Error(
      "You must run Node version 8 or greater to run scripts within jupiter-scripts " +
        "because we run untranspiled versions of scripts."
    );
  }
};

module.exports = { checkNodeVersion };

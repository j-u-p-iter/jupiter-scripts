// if developer run scripts inside scripts repo
// he needs node version >= 8, cause we don't run
// not bundled scripts

const checkNodeVersion = () => {
  const isScriptRanInOriginalPackage = () => {
    // process.cwd. path to current working directory (dicrectory, where we execute script)
    const packageInfo = require(`${process.cwd()}/package.json`);

    return packageInfo.name === "@j.u.p.iter/scripts";
  };

  const isIncorrectNodeVersion = () => {
    const nodeVersion = process.version[1];

    return Number(nodeVersion) < 8;
  };

  if (isScriptRanInOriginalPackage() && isIncorrectNodeVersion()) {
    throw new Error(
      "You must run Node version 8 or greater to run scripts within jupiter-scripts " +
        "because we run untranspiled versions of scripts."
    );
  }
};

module.exports = { checkNodeVersion };

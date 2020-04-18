const fs = require("fs");
const path = require("path");

const getCurrentDirectoryBase = () => {
  return path.basename(process.cwd());
};

const doesDirectoryExist = filePath => {
  return fs.existsSync(filePath);
};

module.exports = {
  getCurrentDirectoryBase,
  doesDirectoryExist
};

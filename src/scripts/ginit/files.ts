const fs = require("fs");
const path = require("path");

type GetCurrentDirectoryBase = () => string;
const getCurrentDirectoryBase: GetCurrentDirectoryBase = () => {
  return path.basename(process.cwd());
};

type DoesDirectoryExist = (filePath: string) => boolean;
const doesDirectoryExist: DoesDirectoryExist = filePath => {
  return fs.existsSync(filePath);
};

module.exports = {
  getCurrentDirectoryBase,
  doesDirectoryExist
};

export {};

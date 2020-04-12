const chalk = require("chalk");

const { doesDirectoryExist } = require("./files");
const { sendRequestToGetAccessToken } = require("./github");

if (doesDirectoryExist(".git")) {
  console.log(chalk.red("Already a Git repository!"));

  process.exit();
}

const runGinit = async () => {
  await sendRequestToGetAccessToken();
};

runGinit();

export {};

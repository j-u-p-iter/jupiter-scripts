const fs = require("fs");
const touch = require("touch");
const _ = require("lodash");
const git = require("simple-git")();

const dialog = require("./dialog");
const ui = require("./ui");

const GITIGNORE_FILE_NAME = ".gitignore";

const createEmptyGitignore = () => {
  touch(GITIGNORE_FILE_NAME);
};

const createGitignore = async () => {
  const fileList = _.without(
    fs.readdirSync(process.cwd()),
    ".git",
    GITIGNORE_FILE_NAME
  );

  if (fileList.length) {
    const { ignore: filesToIgnore } = await dialog.askFilesToIgnore(fileList);

    if (filesToIgnore.length) {
      const fileContent = filesToIgnore.join("\n");

      fs.writeFileSync(GITIGNORE_FILE_NAME, fileContent);
    } else {
      createEmptyGitignore();
    }
  } else {
    createEmptyGitignore();
  }
};

const setUpRepo = async repoUrl => {
  const stopStatusSpinner = ui.showSpinner(
    "Initializing local repository and pushing to remote..."
  );

  await git
    .init()
    .then(git.add("./*"))
    .then(git.commit("Initial commit"))
    .then(git.addRemote("origin", repoUrl))
    .then(git.push("origin", "master"));

  stopStatusSpinner();
};

module.exports = {
  createGitignore,
  setUpRepo
};

export {};

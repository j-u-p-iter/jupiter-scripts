const { doesDirectoryExist } = require("./files");
const ui = require("./ui");

const checkPresenceOfGit = () => {
  if (doesDirectoryExist(".git")) {
    ui.showAlert("Already a Git repository!");

    process.exit();
  }
};

module.exports = {
  checkPresenceOfGit
};

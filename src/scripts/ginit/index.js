const authClient = require("./authClient");
const utils = require("./utils");
const ui = require("./ui");
const github = require("./github");
const repo = require("./repo");

const runGinit = async () => {
  ui.showTitle();

  utils.checkPresenceOfGit();

  await authClient.getAccessToken();

  const { ssh_url: repoUrl } = await github.createRemoteRepo();

  await repo.createGitignore();

  await repo.setUpRepo(repoUrl);
};

runGinit();

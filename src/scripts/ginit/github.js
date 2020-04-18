const { Octokit } = require("@octokit/rest");
const to = require("await-to-js").default;

const storage = require("./localStorage");
const dialog = require("./dialog");
const ui = require("./ui");

let octokit;

const getInstance = () => {
  if (octokit) {
    return octokit;
  }

  const accessToken = storage.get("accessToken");

  octokit = new Octokit({ auth: accessToken });

  return octokit;
};

const createRemoteRepo = async () => {
  const repoDetails = await dialog.askRepoDetails();

  const data = {
    name: repoDetails.name,
    description: repoDetails.description,
    private: repoDetails.visibility === "private"
  };

  const closeRepoSpinner = ui.showSpinner("Creating remote repository...");

  const [, response] = await to(
    getInstance().repos.createForAuthenticatedUser(data)
  );

  closeRepoSpinner();

  return response.data;
};

module.exports = {
  createRemoteRepo
};

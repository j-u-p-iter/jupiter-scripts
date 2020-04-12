const CLI = require("clui");
const Conf = require("conf");
const to = require("await-to-js").default;
const { createBasicAuth } = require("@octokit/auth-basic");

const { askGithubCredentials } = require("./prompt");

const Spinner = CLI.Spinner;
const config = new Conf({
  projectName: "ginit"
});

type GetToken = () => string;
const getToken: GetToken = () => {
  return config.get("github.token");
};

const sendRequestToGetAccessToken = async () => {
  const { username, password } = await askGithubCredentials();

  const authStatus = new Spinner("Authenticating you, please wait...");

  authStatus.start();

  const auth = createBasicAuth({
    username,
    password,
    async on2Fa() {},
    token: {
      scopes: ["user", "public_repo", "repo", "repo:status"],
      note: "ginit, the command-line tool for initializing Git repos"
    }
  });

  const [error, response] = await to(auth());

  console.log(error);
  console.log(response);

  authStatus.stop();
};

module.exports = {
  getToken,
  sendRequestToGetAccessToken
};

export {};

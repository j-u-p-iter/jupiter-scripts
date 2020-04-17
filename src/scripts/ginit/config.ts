const dotenv = require("dotenv");

dotenv.config();

const githubOAuth = {
  clientId: "a81e55cbb41e29e3c1ab",
  clientSecret: "8a3b563e42c6b576fedd8db754fa8b318f88177b",
  scope: "user,repo,public_repo",
  serverHost: "localhost",
  serverPort: 8080,
  authorizeUrl: "https://github.com/login/oauth/authorize",
  getAccessTokenUrl: "https://github.com/login/oauth/access_token"
};

module.exports = {
  githubOAuth
};

export {};

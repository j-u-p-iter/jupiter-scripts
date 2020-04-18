const axios = require("axios");
const hapi = require("@hapi/hapi");
const openPage = require("open");
const to = require("await-to-js").default;
const qs = require("qs");

const ui = require("./ui");
const config = require("./config");
const storage = require("./localStorage");

const {
  clientId,
  clientSecret,
  scope,

  serverHost,
  serverPort,

  authorizeUrl,
  getAccessTokenUrl
} = config.githubOAuth;

const createFullAuthorizationUrl = () => {
  const searchingString = qs.stringify(
    {
      redirect_uri: `http://${serverHost}:${serverPort}/callback`,
      client_id: clientId,
      scope
    },
    { addQueryPrefix: true }
  );

  return `${authorizeUrl}${searchingString}`;
};

const sendRequestToGetAccessToken = async code => {
  return axios.post(
    getAccessTokenUrl,
    {
      code,
      scope,
      client_id: clientId,
      client_secret: clientSecret
    },
    {
      headers: { Accept: "application/json" }
    }
  );
};

const executeAuthFlow = () => {
  return new Promise(async (resolve, reject) => {
    const server = hapi.server({
      port: serverPort,
      host: serverHost
    });

    server.route({
      method: "GET",
      path: "/callback",
      handler: async ({ query: { code } }) => {
        const [
          ,
          {
            data: { error_description: error, access_token: accessToken }
          }
        ] = await to(sendRequestToGetAccessToken(code));

        if (error) {
          reject(error);

          return error;
        }

        resolve({ accessToken });

        server.stop();

        return "Thank you. You can close this tab.";
      }
    });

    await server.start();

    openPage(createFullAuthorizationUrl());
  });
};

const getAccessToken = async () => {
  let accessToken = storage.get("accessToken");

  if (!accessToken) {
    const stopAuthSpinner = ui.showSpinner(
      "Github authentication is running..."
    );

    ({ accessToken } = await executeAuthFlow());

    stopAuthSpinner();

    storage.set("accessToken", accessToken);
  }

  return accessToken;
};

module.exports = {
  getAccessToken
};

const Conf = require("conf");

const config = new Conf({
  projectName: "ginit"
});

const get = key => {
  return config.get(key);
};

const set = (key, value) => {
  config.set(key, value);
};

module.exports = {
  get,
  set
};

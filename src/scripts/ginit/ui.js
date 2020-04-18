const CLI = require("clui");
const chalk = require("chalk");
const figlet = require("figlet");

const Spinner = CLI.Spinner;

const show = value => console.log(value);

const showTitle = () => {
  show(chalk.yellow(figlet.textSync("Ginit", { horizontalLayout: "full" })));
};

const showAlert = value => {
  show(chalk.red(value));
};

const showSpinner = message => {
  const spinner = new Spinner(message);

  spinner.start();

  return () => spinner.stop();
};

module.exports = {
  showTitle,
  showAlert,
  showSpinner,
  show
};

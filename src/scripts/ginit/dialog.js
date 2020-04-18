const yargs = require("yargs");
const inquirer = require("inquirer");

const askRepoDetails = () => {
  const [defaultRepoName, defaultRepoDescription] = yargs.argv._;

  const questions = [
    {
      type: "input",
      name: "name",
      message: "Enter a name for the repository:",
      default: defaultRepoName || "super-repo",
      validate: value => {
        return value.length
          ? true
          : "Please enter a name for the repository.";
      }
    },
    {
      type: "input",
      name: "description",
      message: "Optionally enter a description of the repository:",
      default: defaultRepoDescription || null
    },
    {
      type: "list",
      name: "visibility",
      message: "Public or private:",
      choices: ["public", "private"],
      default: "public"
    }
  ];

  return inquirer.prompt(questions);
};

const askFilesToIgnore = fileList => {
  const questions = [
    {
      type: "checkbox",
      name: "ignore",
      message: "Select the files and/or folders you wish to ignore",
      choices: fileList,
      default: ["node_modules"]
    }
  ];

  return inquirer.prompt(questions);
};

module.exports = {
  askRepoDetails,
  askFilesToIgnore
};

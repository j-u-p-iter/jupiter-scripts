const inquirer = require("inquirer");

const askGithubCredentials = () => {
  const questions = [
    {
      name: "username",
      type: "input",
      message: "Enter your GitHub username or email address:",
      validate: value => {
        return value.length
          ? true
          : "Please enter your username or email address";
      }
    },
    {
      name: "password",
      type: "password",
      message: "Enter your password:",
      validate: value => {
        return value.length ? true : "Please enter your password.";
      }
    }
  ];

  return inquirer.prompt(questions);
};

module.exports = {
  askGithubCredentials
};

export {};

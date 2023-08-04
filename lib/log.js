const chalk = require("chalk");

const success = (msg) => {
    console.log(chalk.green(msg));
};

const error = (msg) => {
    console.log(chalk.red(msg));
};

const warning = (msg) => {
    console.log(chalk.yellow(msg));
};

module.exports = {
    success,
    warning,
    error
};

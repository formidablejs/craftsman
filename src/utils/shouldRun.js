const { default: chalk } = require("chalk");
const inquirer = require("inquirer");

const shouldRun = async (environment) => {
  if (
    environment
    && typeof environment == 'string'
    && environment.toLowerCase().trim() == 'production'
  ) {
    console.log(chalk.green(`**************************************
*     Application In Production!     *
**************************************
`))
    const res = await inquirer.prompt([{
      name: 'run',
      message: 'Do you really wish to run this command',
      type: 'confirm'
    }])

    if (!res.run) {
      console.log(chalk.green('Command Canceled!'));
    }

    return res.run;
  }

  return false;
};

module.exports = shouldRun;

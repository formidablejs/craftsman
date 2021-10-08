const chalk = require('chalk');
const fs = require('fs')
const { exit } = require('process')

module.exports = async function (options) {
  if (['-v', '--version', '-h', '--help', 'new'].includes(options.id)) return;

  if (!fs.existsSync('bootstrap/app.imba')) {
    console.error(chalk.red('Project missing...'));

    exit();
  }
}

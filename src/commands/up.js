const { Command } = require('@oclif/command');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

class UpCommand extends Command {
  async run() {
    const downFile = path.join(process.cwd(), 'storage', 'framework', 'down.json');

    if (!fs.existsSync(downFile)) {
      return console.log(chalk.green('Application is already up.'));
    }

    fs.unlinkSync(downFile);

    if (fs.existsSync(downFile)) {
      return console.log(chalk.green('Failed to bring application out of maintenance.'));
    }

    console.log(chalk.green('Application is now live.'));
  }
}

UpCommand.description = `Bring the application out of maintenance mode`;

module.exports = UpCommand;

const { Command, flags } = require('@oclif/command');
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');

class DownCommand extends Command {
  async run() {
    const { flags } = this.parse(DownCommand);

    const downFile = path.join(process.cwd(), 'storage', 'framework', 'down.json');

    if (fs.existsSync(downFile)) {
      return console.log(chalk.green('Application is already down.'));
    }

    const downObject = {};

    if (flags.message) {
      downObject.message = flags.message;
    }

    if (flags.redirect) {
      downObject.redirect = flags.redirect;
    }

    if (flags.retry) {
      downObject.retry = flags.retry;
    }

    if (flags.refresh) {
      downObject.refresh = flags.refresh;
    }

    if (flags.secret) {
      downObject.secret = flags.secret;
    }

    if (flags.status && flags.status !== 503) {
      downObject.statusCode = flags.status;
    }

    fs.outputFileSync(downFile, JSON.stringify(downObject, null, 4), {
      encoding: 'utf8',
    });

    if (fs.existsSync(downFile)) {
      return console.log(chalk.green('Application is now in maintenance mode.'));
    }

    console.log(chalk.red('Failed to put application in maintenance mode.'));
  }
}

DownCommand.description = `Put the application into maintenance mode`;

DownCommand.flags = {
  message: flags.string({ description: 'The message for the maintenance mode' }),
  retry: flags.integer({ description: 'The number of seconds after which the request may be retried' }),
  refresh: flags.integer({ description: 'The number of seconds after which the browser may refresh' }),
  secret: flags.string({ description: 'The secret phrase that may be used to bypass maintenance mode' }),
  status: flags.integer({ description: 'The status code that should be used when returning the maintenance mode response', default: 503 }),
  redirect: flags.string({ description: 'The URL to which the browser should be redirected' }),
}

module.exports = DownCommand;

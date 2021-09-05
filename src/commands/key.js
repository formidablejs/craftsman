const { Command } = require('@oclif/command');
const { default: chalk } = require('chalk');
const fs = require('fs');
const path = require('path');

/**
 * Generates a key for the application.
 *
 * @param {Number} length
 */
const generate = (length) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let key = '';
  for (let i = 0; i < length; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return key;
}

class KeyCommand extends Command {
  async run() {
    const envPath = path.join(process.cwd(), '.env');

    if (!fs.existsSync(envPath)) {
      return console.error('No .env file found');
    }

    const envContent = fs.readFileSync(envPath, 'utf8');

    const env = [];

    envContent.split('\n').map((line) => {
      if (line.startsWith('APP_KEY')) {
        line = `APP_KEY=${generate(40)}`;
      }

      env.push(line);
    });

    fs.writeFileSync(envPath, env.join('\n'), {
      encoding: 'utf8',
    });

    this.log(chalk.green('Application key set successfully.'));
  }
}

KeyCommand.description = `Set the application key`;

module.exports = KeyCommand;

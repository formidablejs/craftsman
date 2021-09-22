const { Command } = require('@oclif/command');
const { default: chalk } = require('chalk');
const path = require('path');

class SeedCommand extends Command {

  async run() {
    const { Application } = require(path.join(process.cwd(), '.formidable', 'server.app.js'));

    await Application.then(async (app) => {
      console.log('Using environment: ' + chalk.cyan(app.config.get('app.env')));

      const results = await app.seeder().run();

      if (results == false) {
        throw new Error('Seeding failed');
      }

      if (Array.isArray(results)) {
        results[0].forEach((seeder) => {
          console.log(chalk.green('Seeded: ') + seeder);
        });

        return;
      }

      console.error(results);
    });

    this.exit();
  }
}

SeedCommand.description = 'Run seeders';

module.exports = SeedCommand;

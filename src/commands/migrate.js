const { Command, flags } = require('@oclif/command');
const chalk = require('chalk');
const path = require('path');
const shouldRun = require('../utils/shouldRun');

class MigrateCommand extends Command {
  static args = [
    {
      name: 'action',
      required: true,
      description: 'Migration action',
      options: [
        'up',
        'down',
        'rollback',
        'latest',
        'fresh'
      ]
    }
  ];

  async run() {
    const { flags, args } = this.parse(MigrateCommand);

    const { Application } = require(path.join(process.cwd(), '.formidable', 'server.app.js'));

    await Application.then(async (app) => {
      /** @type {String} */
      const environment = app.config.get('app.env');

      if (flags['no-interaction'] !== true) {
        const runCommand = await shouldRun(environment);

        if (!runCommand) return;
      }

      console.log('Using environment: ' + chalk.cyan(environment));

      let results;

      if (args.action === 'up' || args.action === 'down') {
        results = await app.migration().migrate(flags.migration, args.action == 'up' ? true : false);
      } else if (args.action == 'latest') {
        results = await app.migration().latest();
      } else if (args.action == 'rollback') {
        results = await app.migration().rollback(flags.all);
      } else if (args.action == 'fresh') {
        results = await app.migration().rollback(true)

        if (results == false) throw new Error('Migration failed');

        results = await app.migration().latest();
      }

      if (results == false) throw new Error('Migration failed');

      if (results[1].length > 0) {
        results[1].forEach((migration) => {
          console.log((
            args.action == 'rollback'
              ? chalk.redBright('Rollback: ')
              : chalk.green('Migrate: ')
          ) + migration)
        });

        return;
      }

      console.log(chalk.redBright('No migrations to run'));
    });

    this.exit();
  }
}

MigrateCommand.description = `Handle migrations

up               Runs the specified or latest migration
down             Will undo the specified or latest migration
rollback         Rolls back the latest migration group
latest           Runs the latest migration
fresh            Rolls back all migrations and runs the latest migrations
`

MigrateCommand.flags = {
  migration: flags.string({ char: 'm', description: 'Target specific migration' }),
  all: flags.boolean({ char: 'a', description: 'Rollback all migrations', default: true }),
  'no-interaction': flags.boolean({ char: 'n', description: 'Do not ask any interactive question', default: false }),
};

module.exports = MigrateCommand;

const { Command, flags } = require('@oclif/command');
const { default: chalk } = require('chalk');
const path = require('path');

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
      ]
    }
  ];

  async run() {
    const { flags, args } = this.parse(MigrateCommand);

    const { Application } = require(path.join(process.cwd(), '.formidable', 'server.app.js'));

    await Application.then(async (app) => {
      console.log('Using environment: ' + chalk.cyan(app.config.get('app.env')));

      let results;

      if (args.action === 'up' || args.action === 'down') {
        results = await app.migration().migrate(flags.migration, args.action == 'up' ? true : false);
      } else if (args.action == 'latest') {
        results = await app.migration().latest();
      } else if (args.action == 'rollback') {
        results = await app.migration().rollback(flags.all);
      }

      if (results == false) {
        throw new Error('Migration failed');
      }

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
`

MigrateCommand.flags = {
  migration: flags.string({ char: 'm', description: 'Target specific migration' }),
  all: flags.boolean({ char: 'a', description: 'Rollback all migrations', default: true }),
};

module.exports = MigrateCommand;

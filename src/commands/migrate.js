const { Command, flags } = require('@oclif/command');
const DBMigrate = require('db-migrate');
const fs = require('fs');
const path = require('path');
// const { cli } = require('cli-ux')
// const { exec } = require('child_process');

// const output = path.join(process.cwd(), 'node_modules', '.cache', 'formidable', 'database', 'migrations');

// if (fs.existsSync(output) && fs.statSync(output).isDirectory()) {
//   fs.rmSync(output, { recursive: true });
// }

const migrationsDir = path.join(process.cwd(), 'database', 'migrations');

const database = (name = 'migrations') => {
  return DBMigrate.getInstance(true, {
    cwd: migrationsDir.substring(0, migrationsDir.lastIndexOf('/')),
    config: 'bootstrap/cache/database.json',
    name: [name],
    env: 'default',
  });
};

// /**
//  * Compile imba migration files.
//  *
//  * @param {string} file
//  * @param {string} output
//  * @returns {Promise}
//  */
//  const compile = (migrationsDir) => {
// 	return new Promise((resolve, reject) => {
//     fs.readdirSync(migrationsDir).filter(async (migration) => {
//       if (path.extname(migration) === '.imba') {
//         let file = path.join(migrationsDir, migration)

//         exec(`node node_modules/.bin/imbac ${file} --output=${output}`, (error, stdout, stderr) => {
//           if (error) return reject(error);

//           resolve(stdout ? stdout : stderr);
//         })
//       }
//     });
// 	})
// }

class MigrateCommand extends Command {
  static args = [
    {
      name: 'action',
      required: true,
      description: 'Migration action',
      options: [
        'up',
        'down',
        'refresh'
      ]
    }
  ];

  async run() {
    const { flags, args } = this.parse(MigrateCommand);

    if (!fs.existsSync(migrationsDir)) return this.error('No migrations found');

    let count = 0;

    fs.readdirSync(migrationsDir).filter((migration) => {
      if (path.extname(migration) === '.js') {
        count = count + 1;
      }
    });

    const action = args.action == 'refresh' ? 'reset' : args.action;
    const specOrCount = (flags.migration ? flags.migration : (flags.count ?? null)) ?? count;

    database()[action](specOrCount);

    // compile(migrationsDir)
    //   .then(() => {
    //     const action = args.action == 'refresh' ? 'reset' : args.action;
    //     const specOrCount = (flags.migration ? flags.migration : (flags.count ?? null)) ?? count;

    //     database()[action](specOrCount);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
  }
}

MigrateCommand.description = `Handle migrations

up               Run the database migrations
down             Rollback all database migrations
refresh          Migrates all currently executed migrations down
`

MigrateCommand.flags = {
  migration: flags.string({ char: 'm', description: 'Target specific migration' }),
  count: flags.integer({ char: 'c', description: 'Number of migrations to be executed' }),
};

module.exports = MigrateCommand;

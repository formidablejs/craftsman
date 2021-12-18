/**
 * This needs a re-write.
 *
 * Please, feel free to contribute.
 */

const { cli } = require('cli-ux');
const { Command, flags } = require('@oclif/command');
const { default: axios } = require('axios');
const { exec } = require('child_process');
const { tmpdir } = require('os');
const { copySync } = require('fs-extra');
const chalk = require('chalk');
const fs = require('fs');
const inquirer = require('inquirer');
const path = require('path');
const unzipper = require('unzipper');
const updateLine = require('../utils/updateLine');
const getLine = require('../utils/getLine');

const downloadFile = (fileUrl, outputLocationPath) => {
  const writer = fs.createWriteStream(outputLocationPath);

  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);

      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(true);
        }
      });
    });
  });
}

const settings = {
  dbDriver: '',
  location: '',
  name: '',
  manager: '',
  web: false,
  frontend: ''
}

class NewCommand extends Command {
  static args = [
    {
      name: 'name',
      required: true,
      description: 'API name'
    },
  ];

  async run() {
    const { args, flags } = this.parse(NewCommand);

    if (/[^a-z0-9-_]/gi.test(args.name)) {
      return this.error(`${chalk.red('Invalid name.')}`);
    }

    if (fs.existsSync(args.name)) {
      return this.error(`A folder with the name "${args.name}" already exists`);
    }

    const skeleton = path.join(tmpdir(), 'formidablejs-master.zip');
    const location = path.join(process.cwd(), args.name);
    const type = flags.web ? 'web' : 'api';

    console.log(`⚡ We will scaffold your ${type} application in a few seconds.\n`);

    downloadFile('https://github.com/formidablejs/formidablejs/archive/refs/heads/main.zip', skeleton).then(async (response) => {
      if (response !== true) return console.error('Could not fetch formidablejs');

      const directory = await unzipper.Open.file(skeleton);

      Object.values(directory.files).forEach((entry) => {
        const dir = entry.path.split('/');

        dir.shift();

        const entryPath = path.join(location, dir.join('/'));

        if (entry.type == 'Directory') {
          fs.mkdirSync(entryPath, {
            recursive: true
          });
        } else {
          if (entry.path.split('/').pop() !== 'package-lock.json') {
            entry.stream()
              .pipe(fs.createWriteStream(entryPath))
              .on('error', (error) => {
                console.error('Could not create Formidablejs project');

                this.exit;
              });

            console.log(chalk.green('CREATE') + ' ' + entryPath);
          }
        }
      });

      if (!flags.manager) {
        const res = await inquirer.prompt([{
          name: 'manager',
          message: 'Which package manager do you want to use?',
          type: 'list',
          choices: [{ name: 'npm' }, { name: 'yarn' }],
        }]);

        flags.manager = res.manager;
      } else {
        console.log(chalk.dim(`Installing with ${flags.manager}...`));
      }

      if (!flags.database) {
        const res = await inquirer.prompt([{
          name: 'dbDriver',
          message: 'Which database do you want to use?' + chalk.dim(' (You can change this later)'),
          type: 'list',
          default: 'MySQL / MariaDB',
          choices: [
            { name: 'MySQL / MariaDB' },
            { name: 'PostgreSQL / Amazon Redshift' },
            { name: 'SQLite' },
            { name: 'MSSQL' },
            { name: 'Oracle' },
            { name: chalk.dim('I will set this up later') }
          ],
        }]);

        flags.database = res.dbDriver;
      } else {
        if (flags.database !== 'skip') console.log(chalk.dim(`Using ${flags.database}...`));
      }

      if (flags.web && !flags.frontend) {
        const res = await inquirer.prompt([{
          name: 'frontend',
          message: 'Which frontend framework do you want to use?',
          type: 'list',
          default: 'Imba',
          choices: [
            { name: 'Imba' },
            { name: 'Vue' },
            { name: 'React' },
          ],
        }]);

        flags.frontend = res.frontend;
      }

      cli.action.start('Installation in progress. This might take a while ☕');

      settings.dbDriver = flags.database.toLowerCase();
      settings.location = location;
      settings.name = args.name;
      settings.manager = flags.manager;
      settings.web = flags.web;
      settings.frontend = flags.frontend;

      installDependencies();
    }).catch(() => {
      console.log('Could not scaffold your application');
    });
  }
};

NewCommand.description = `Craft a new Formidable application`;

const installDependencies = () => {
  const install = exec(
    settings.manager == 'npm'
      ? `npm i --legacy-peer-deps`
      : `yarn install --legacy-peer-deps`,
    { cwd: settings.location }
  );

  install.stderr.on('data', (data) => {
    if (
      data.trim().toLowerCase().startsWith('err')
      || data.trim().toLowerCase().startsWith('npm err')
      || data.trim().toLowerCase().startsWith('/bin/sh:')
    ) {
      console.error(data);

      cli.action.stop('Failed');

      fs.rmSync(settings.location, {
        recursive: true
      });

      console.log(chalk.red('REMOVE ') + settings.location);

      process.exit(0);
    }
  });

  install.on('exit', () => {
    publishWeb();
  });
}

const publishWeb = () => {
  if (settings.web) {
    const publish = exec('craftsman publish --package=@formidablejs/framework --tag="web" --force', {
      cwd: settings.location
    });

    publish.on('exit', () => {
      installPrettyErrors();
    });

    return;
  }

  installPrettyErrors();
}

const installPrettyErrors = () => {
  if (!settings.web) return installDatabaseDriver();

  const install = exec(
    settings.manager == 'npm'
      ? `npm i @formidablejs/pretty-errors`
      : `yarn add @formidablejs/pretty-errors`,
    { cwd: settings.location }
  );

  install.stderr.on('data', (data) => {
    if (
      data.trim().toLowerCase().startsWith('err')
      || data.trim().toLowerCase().startsWith('npm err')
      || data.trim().toLowerCase().startsWith('/bin/sh:')
    ) {
      console.error(data);

      cli.action.stop('Failed');

      fs.rmSync(settings.location, {
        recursive: true
      });

      console.log(chalk.red('REMOVE ') + settings.location);

      process.exit(0);
    }
  });

  install.on('exit', () => {
    const config = path.join(settings.location, 'config', 'app.imba');

    updateLine(config, (line, index) => {
      if (
        line.trim() == ''
        && getLine(config, index - 1).startsWith('import {')
      ) {
        return "import { PrettyErrorsServiceResolver } from '@formidablejs/pretty-errors'\n"
      }

      if (line.trim() == 'MaintenanceServiceResolver') {
        return `${line}\n		PrettyErrorsServiceResolver`
      }

      return line;
    });

    installInertia();
  });
};

const installInertia = () => {
  if (!settings.web && settings.frontend !== 'Imba') return installDatabaseDriver();;

  const install = exec(
    settings.manager == 'npm'
      ? `npm i @formidablejs/inertia@next`
      : `yarn add @formidablejs/inertia@next`,
    { cwd: settings.location }
  );

  install.stderr.on('data', (data) => {
    if (
      data.trim().toLowerCase().startsWith('err')
      || data.trim().toLowerCase().startsWith('npm err')
      || data.trim().toLowerCase().startsWith('/bin/sh:')
    ) {
      console.error(data);

      cli.action.stop('Failed');

      fs.rmSync(settings.location, {
        recursive: true
      });

      console.log(chalk.red('REMOVE ') + settings.location);

      process.exit(0);
    }
  });

  install.on('exit', () => {
    const appConfig = path.join(settings.location, 'config', 'app.imba');

    updateLine(appConfig, (line, index) => {
      if (line.trim().startsWith('import { ValidationServiceResolver }')) {
        return `${line}\nimport { InertiaServiceResolver } from '@formidablejs/inertia'`
      }

      if (line.trim() == 'MaintenanceServiceResolver') {
        return `${line}\n		InertiaServiceResolver`
      }

      return line;
    });

    const indexConfig = path.join(settings.location, 'config', 'index.imba');

    updateLine(indexConfig, (line, index) => {
      if (line.trim().startsWith('import hashing')) {
        return `${line}\nimport inertia from './inertia'`
      }

      if (line.trim() == 'hashing') {
        return `${line}\n			inertia`
      }

      return line;
    });

    /** remove welcome.imba file */
    fs.rmSync(path.join(settings.location, 'resources', 'views', 'welcome.imba'));

    exec('craftsman publish --package=@formidablejs/inertia --tag="vendor" --force', {
      cwd: settings.location
    });

    const presetPath = path.join(settings.location, 'node_modules', '@formidablejs/inertia', 'formidable', 'presets', settings.frontend.toLowerCase(), 'preset.json');

    const preset = JSON.parse(fs.readFileSync(presetPath).toString());

    const presetFiles = path.join(settings.location, 'node_modules', '@formidablejs/inertia', 'formidable', 'presets', settings.frontend.toLowerCase(), preset.files)

    copySync(presetFiles, settings.location)

    const packageName = path.join(settings.location, 'package.json');

    const package = JSON.parse(fs.readFileSync(packageName).toString());

    package.scripts = Object.assign(package.scripts, preset.npm.scripts);
    package.devDependencies = Object.assign(package.devDependencies, preset.npm.devDependencies);

    fs.writeFileSync(packageName, JSON.stringify(package, null, 2));

    const installFrontendDeps = exec(
      settings.manager == 'npm'
        ? `npm i --legacy-peer-deps`
        : `yarn install --force`,
      { cwd: settings.location }
    );

    installFrontendDeps.on('exit', () => {
      installDatabaseDriver();
    });
  });
}

const installDatabaseDriver = () => {
  let driver = ''

  switch (settings.dbDriver) {
    case 'mysql / mariadb':
      driver = 'mysql';
      break;

    case 'postgresql / amazon redshift':
      driver = 'pg';
      break;

    case 'sqlite':
      driver = 'sqlite3';
      break;

    case 'mssql':
      driver = 'tedious';
      break;

    case 'oracle':
      driver = 'oracledb';
      break;

    default:
      driver = ''
      break;
  }

  if (driver == '') return publishEmails();

  const install = exec(
    settings.manager == 'npm'
      ? `npm i ${driver} --save --legacy-peer-deps`
      : `yarn add ${driver} --legacy-peer-deps`,
    { cwd: settings.location }
  );

  install.stderr.on('data', (data) => {
    if (
      data.trim().toLowerCase().startsWith('err!')
      || data.trim().toLowerCase().startsWith('npm err!')
    ) {
      console.error(data);

      cli.action.stop('Failed');

      fs.rmSync(settings.location, {
        recursive: true
      });

      console.log(chalk.red('REMOVE ') + settings.location);

      process.exit(0);
    }
  });

  install.on('exit', () => {
    publishEmails();
  });
}

const publishEmails = () => {
  cli.action.start('Setting up application');

  const publish = exec('craftsman publish --package=@formidablejs/framework --tag="auth-emails"', {
    cwd: settings.location
  });

  publish.on('exit', () => {
    publishTemplates();
  });
}

const publishTemplates = () => {
  const publish = exec('craftsman publish --package=@formidablejs/mailer --tag="components,config"', {
    cwd: settings.location
  });

  publish.on('exit', () => {
    makeEnv();
  });
}

const makeEnv = () => {
  fs.copyFileSync(path.join(settings.location, '.env.example'), path.join(settings.location, '.env'));

  const env = exec('craftsman key', {
    cwd: settings.location
  });

  env.on('exit', () => {
    setPackageName();
    commentOutClientUrl();
    setSession();
    setDatabase();
  });
}

const setPackageName = () => {
  const packageName = path.join(settings.location, 'package.json');

  const package = JSON.parse(fs.readFileSync(packageName).toString());

  package.name = settings.name.replace(new RegExp(' ', 'g'), '-');

  fs.writeFileSync(packageName, JSON.stringify(package, null, 2));
}

const commentOutClientUrl = () => {
  if (!settings.web) return;

  updateLine(path.join(settings.location, '.env'), (line) => {
    if (line.trim() == 'CLIENT_URL=http://localhost:8000') {
      line = '# CLIENT_URL=http://localhost:8000';
    }

    return line;
  });
}

const setSession = () => {
  if (!settings.web) return;

  updateLine(path.join(settings.location, 'config', 'session.imba'), (line) => {
    if (line.trim() == "driver: 'memory'") {
      line = "	driver: 'file'";
    }

    return line;
  });

  updateLine(path.join(settings.location, 'config', 'session.imba'), (line) => {
    if (line.trim() == "same_site: helpers.env 'SESSION_SAME_SITE', 'none'") {
      line = "	same_site: helpers.env 'SESSION_SAME_SITE', 'lax'";
    }

    return line;
  });
}

const setDatabase = () => {
  if (settings.dbDriver == 'skip' || settings.dbDriver == 'i will set this up later') {
    return cacheConfig();
  }

  let connection;

  switch (settings.dbDriver) {
    case 'mysql / mariadb':
      connection = 'mysql';
      break;

    case 'postgresql / amazon redshift':
      connection = 'pgsql';
      break;

    case 'sqlite':
      connection = 'sqlite';
      break;

    case 'mssql':
      connection = 'mssql';
      break;

    case 'oracle':
      connection = 'oracle';
      break;
  }

  updateLine(path.join(settings.location, '.env'), (line) => {
    if (line.startsWith('DB_CONNECTION')) {
      line = `DB_CONNECTION=${connection}`;
    }

    return line;
  });

  if (connection == 'sqlite') {
    updateLine(path.join(settings.location, 'config', 'database.imba'), (line) => {
      if (line.trim() == 'useNullAsDefault: null') {
        line = '	useNullAsDefault: true';
      }

      return line;
    });
  }

  cacheConfig();
}

const cacheConfig = () => {
  const cache = exec('craftsman cache', {
    cwd: settings.location
  });

  cache.on('exit', () => {
    cli.action.stop('Done');

    console.log(chalk.green('\n✅ Your application is ready!'));
    console.log(chalk.green('👉 Get started with the following commands:\n'));
    console.log(chalk.dim(`$  cd ${settings.name}`));
    console.log(chalk.dim(`$  ${settings.manager} start`));
  });
}

NewCommand.flags = {
  manager: flags.string({ options: ['npm', 'yarn'], char: 'm' }),
  database: flags.string({ options: ['MySQL / MariaDB', 'PostgreSQL / Amazon Redshift', 'SQLite', 'MSSQL', 'skip'], char: 'd' }),
  web: flags.boolean({ description: 'Craft a web application', char: 'w' }),
  frontend: flags.string({ options: ['Imba', 'Vue', 'React'], char: 'e' }),
}

module.exports = NewCommand;

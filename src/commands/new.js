/**
 * This needs a re-write.
 *
 * Please, feel free to contribute.
 */

const { cli } = require('cli-ux');
const { Command, flags } = require('@oclif/command');
const { default: axios } = require('axios');
const { default: chalk } = require('chalk');
const { exec } = require('child_process');
const { tmpdir } = require('os');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

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

    console.log('⚡ We will scaffold your application in a few seconds.\n');

    downloadFile('https://github.com/formidablejs/formidablejs/archive/refs/heads/main.zip', skeleton).then( async (response) => {
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
          choices: [{name:'npm'}, {name: 'yarn'}],
        }]);

        flags.manager = res.manager;
      }

      cli.action.start('Installation in progress. This might take a while ☕');

      installDependencies(flags.manager, location, args.name)
    }).catch(() => {
      console.log('Could not scaffold your application');
    });
  }
};

NewCommand.description = `Craft a new Formidable application`;

const installDependencies = (manager, location, name) => {
  const install = exec(manager == 'npm' ? 'npm i --legacy-peer-deps' : 'yarn install --legacy-peer-deps', {
    cwd: location
  });

  install.stderr.on('data', (data) => {
    cli.action.stop('Failed');

    fs.rmSync(location, {
      recursive: true
    });

    console.error(data);

    console.log(chalk.red('REMOVE ') + location);
  });

  install.on('exit', () => {
    publishEmails(manager, location, name);
  });
}

const publishEmails = (manager, location, name) => {
  cli.action.start('Setting up application');

  const publish = exec('craftsman install --package=@formidablejs/framework -v', {
    cwd: location
  });

  publish.on('exit', () => {
    publishTemplates(manager, location, name);
  });
}

const publishTemplates = (manager, location, name) => {
  const publish = exec('craftsman install --package=@formidablejs/mailer -v', {
    cwd: location
  });

  publish.on('exit', () => {
    makeEnv(manager, location, name);
  });
}

const makeEnv = (manager, location, name) => {
  fs.copyFileSync(path.join(location, '.env.example'), path.join(location, '.env'));

  const env = exec('craftsman key', {
    cwd: location
  });

  env.on('exit', () => {
    setPackageName(location, name);
    cacheConfig(manager, location, name);
  });
}

const setPackageName = (location, name) => {
  const packageName = path.join(location, 'package.json');

  const package = JSON.parse(fs.readFileSync(packageName).toString());

  package.name = name.replaceAll(' ', '-');

  fs.writeFileSync(packageName, JSON.stringify(package, null, 2));
}

const cacheConfig = (manager, location, name) => {
  const cache = exec('craftsman cache', {
    cwd: location
  });

  cache.on('exit', () => {
    cli.action.stop('Done');

    console.log(chalk.green('\n✅ Your application is ready!'));
    console.log(chalk.green('👉 Get started with the following commands:\n'));
    console.log(chalk.dim(`$  cd ${name}`));
    console.log(chalk.dim(`$  ${manager} start`));
  });
}

NewCommand.flags = {
  manager: flags.string({ options: ['npm', 'yarn'], char: 'm' }),
}

module.exports = NewCommand;

/**
 * This needs a re-write.
 *
 * Please, feel free to contribute.
 */

const { Command } = require('@oclif/command');
const { default: axios } = require('axios');
const { tmpdir } = require('os');
const fs = require('fs');
const path = require('path');
const { cli } = require('cli-ux');
const unzipper = require('unzipper');
const { exec } = require('child_process');

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
			description: 'Application name'
		},
  ];

  async run() {
    const { args } = this.parse(NewCommand);

    if (fs.existsSync(args.name)) {
      return this.error(`A folder with the name "${args.name}" already exists`);
    }

    cli.action.start('Fetching formidablejs');

    const skeleton = path.join(tmpdir(), 'formidablejs-master.zip');
    const location = path.join(process.cwd(), args.name);

    downloadFile('https://github.com/formidablejs/formidablejs/archive/refs/heads/main.zip', skeleton).then( async (response) => {
      if (response !== true) return cli.action.stop('Could not fetch formidablejs');

      cli.action.start('Creating Formidablejs project');

      const directory = await unzipper.Open.file(skeleton);

      Object.values(directory.files).forEach((entry) => {
        const dir = entry.path.split('/');

        dir.shift();

        const entryPath = path.join(location, dir.join('/'));

        if (entry.type == 'Directory') {
          fs.mkdirSync(entryPath, {
            recursive: true
          })
        } else {
          entry.stream()
            .pipe(fs.createWriteStream(entryPath))
            .on('error', (error) => {
              console.error('Could not create Formidablejs project');

              this.exit;
            })
        }
      });

      cli.action.start('Installing dependencies');

      installDependencies(location)
    }).catch(() => {
      cli.action.stop('Could not fetch formidablejs');
    });
  }
};

NewCommand.description = `Craft a new Formidable application`;

const installDependencies = (location) => {
  const install = exec('npm i --legacy-peer-deps', {
    cwd: location
  });

  install.stdout.pipe(process.stdout);

  install.on('exit', () => {
    publishEmails(location);
  });
}

const publishEmails = (location) => {
  cli.action.start('Setting up application');

  const publish = exec('craftsman install --package=@formidablejs/framework -v', {
    cwd: location
  });

  publish.stdout.pipe(process.stdout);

  publish.on('exit', () => {
    publishTemplates(location);
  });
}

const publishTemplates = (location) => {
  const publish = exec('craftsman install --package=@formidablejs/mailer -v', {
    cwd: location
  });

  publish.stdout.pipe(process.stdout);

  publish.on('exit', () => {
    makeEnv(location);
  });
}

const makeEnv = (location) => {
  fs.copyFileSync(path.join(location, '.env.example'), path.join(location, '.env'));

  const env = exec('craftsman key', {
    cwd: location
  });

  env.stdout.pipe(process.stdout);

  env.on('exit', () => {
    cacheConfig(location);
  });
}

const cacheConfig = (location) => {
  const cache = exec('craftsman cache', {
    cwd: location
  });

  cache.stdout.pipe(process.stdout);

  cache.on('exit', () => {
    cli.action.stop('Done');
  });
}

module.exports = NewCommand;

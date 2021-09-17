const { cli } = require('cli-ux')
const { Command, flags } = require('@oclif/command');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class CacheCommand extends Command {
  async run() {
    const { flags } = this.parse(CacheCommand);

    cli.action.start('Caching');

    cache(flags);
  }
}

const cache = (flags) => {
  const output = path.join(process.cwd(), 'node_modules', '.cache', 'formidablejs')

  const command = `node node_modules/.bin/imba build server.app.imba --outdir=${output} --clean`

  const imba = exec(command)

  imba.stdout.on('data', async (data) => {
    if (data.includes('finished in ')) {
      process.env.BUILD_ENV = flags.env;

      const { Application } = require(path.join(output,'server.app.js'))

      await Application.then((app) => {
        fs.rmSync(output, { recursive: true });

        app.cache(flags.dist);

        cli.action.stop();
      });
    }
  });

  imba.stderr.on('data', (data) => {
    if (flags.debug) {
      console.error(data.trim());

      return console.log('Run with --debug to see the detailed error.')
    }

    cli.action.stop('failed');
  });

  imba.on('exit', () => {
    delete process.env.BUILD_ENV

    if (!flags.continue) {
      process.exit(0)
    }
  });
}
CacheCommand.description = `Cache application config`

CacheCommand.flags = {
  debug: flags.boolean({char: 'd', description: 'Run in debug mode - show errors if cache fails'}),
  env: flags.option({ char: 'e', description: 'The environment to build for', default: 'local', options: ['local', 'testing', 'development', 'staging', 'production'] }),
  continue: flags.boolean({char: 'x', description: 'Continue running after cache', default: false}),
  dist: flags.boolean({char: 'i', description: 'Distribute cache', default: false}),
}

module.exports = CacheCommand

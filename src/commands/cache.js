const { cli } = require('cli-ux')
const { exec } = require('child_process');
const { Command, flags } = require('@oclif/command');
const fs = require('fs');
const path = require('path');

class CacheCommand extends Command {
  async run() {
    const { flags } = this.parse(CacheCommand)

    cli.action.start('Caching');

    cache(1, flags.debug);
  }
}

const cache = (tick = 1, debug) => {
  const output = path.join(process.cwd(), 'node_modules', '.cache', 'formidable')

  const command = `node node_modules/.bin/imba build server.cli.imba --outdir=${output} --clean`

  const imba = exec(command)

  imba.stdout.on('data', async (data) => {
    if (data.includes('finished in ')) {
      const { Application } = require(path.join(output,'server.cli.js'))

      await Application.then((app) => {
        fs.rmSync(output, { recursive: true });

        if (tick === 1) {
          cache(2, debug);

          return;
        }

        cli.action.stop();
      });
    }
  });

  imba.stderr.on('data', (data) => {
    if (debug) {
      console.error(data.trim());

      return console.log('Run with --debug to see the detailed error.')
    }

    cli.action.stop('failed');
  });

  imba.on('exit', () => {
    process.exit(0)
  });
}
CacheCommand.description = `Cache application config`

CacheCommand.flags = {
  debug: flags.boolean({char: 'd', description: 'Run in debug mode - show errors if cache fails'})
}

module.exports = CacheCommand

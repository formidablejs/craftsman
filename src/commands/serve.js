const { Command, flags } = require('@oclif/command')
const { exec } = require('child_process')
const nodemon = require('nodemon');

class ServeCommand extends Command {
  async run() {
    const { flags } = this.parse(ServeCommand);

    if (flags.dev || flags.test) {
      const minify     = flags.minify ? '--minify' : '';
      const _minify    = flags['no-minify'] ? '--no-minify' : '';
      const _sourceMap = flags['no-sourcemap'] ? '-S' : '';
      const _hashing   = flags['no-hashing'] ? '-H' : '';

      const server = nodemon({
        ext: 'imba',
        ignore: ['bootstrap/compiled'],
        exec: flags.test
          ? `node node_modules/.bin/imba build server.cli.imba ${_minify} ${minify} ${_sourceMap} ${_hashing} --outdir=bootstrap/compiled --clean && node node_modules/.bin/imba server.imba`
          : 'node node_modules/.bin/imba server.imba'
      });

      server.on('start', () => {
        console.log("\x1b[32mStarting Formidable development server\x1b[0m");
      }).on('crash', () => {
        console.log('Application crashed');
      }).on('restart', () => {
        console.log("\x1b[32mRestarting Formidable development server\x1b[0m");
      });

      process.on('SIGINT', function() {
        process.exit();
      });

      return;
    }

    const command = `node node_modules/.bin/imba server.imba`;

    const server = exec(command);

    server.stdout.on('data', (data) => {
      console.log(data.trim());
    });

    server.stderr.on('data', (data) => {
      console.error(data);
    });
  }
}

ServeCommand.description = `Serve Formidable application`;

ServeCommand.flags = {
  dev : flags.boolean({char: 'd', description: 'Serve in dev mode'}),
  test: flags.boolean({char: 't', description: 'Serve in dev mode and compile a test build'}),
  minify: flags.boolean({char: 'm', description: 'Minify generated files'}),
  'no-minify': flags.boolean({char: 'M', description: 'Disable minifying', default: true }),
  'no-sourcemap': flags.boolean({char: 'S', description: 'Disable sourcemaps', default: true }),
  'no-hashing': flags.boolean({char: 'H', description: 'Disable hashing' }),
};

module.exports = ServeCommand;

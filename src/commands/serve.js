const { Command, flags } = require('@oclif/command')
const { exec } = require('child_process')
const Cache = require('./cache')
const nodemon = require('nodemon');

class ServeCommand extends Command {
  async run() {
    const { flags } = this.parse(ServeCommand);

    if (isNaN(flags.port)) {
      return this.error('Port must be a number');
    }

    process.env.FORMIDABLE_PORT = flags.port;

    if (flags.dev) {
      const minify     = flags.minify ? '--minify' : '';
      const _minify    = flags['no-minify'] ? '--no-minify' : '';
      const _sourceMap = flags['no-sourcemap'] ? '-S' : '';
      const _hashing   = flags['no-hashing'] ? '-H' : '';

      const server = nodemon({
        ext: 'imba',
        ignore: ['dist', '.formidable'],
        exec: `node node_modules/.bin/craftsman build --silent ${_minify} ${minify} ${_sourceMap} ${_hashing} && node node_modules/.bin/imba server.imba`
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

    await Cache.run(['--env', flags.env, '--continue']);

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
  'no-hashing': flags.boolean({char: 'H', description: 'Disable hashing' }),
  'no-minify': flags.boolean({char: 'M', description: 'Disable minifying', default: true }),
  'no-sourcemap': flags.boolean({char: 'S', description: 'Disable sourcemaps', default: true }),
  dev : flags.boolean({char: 'd', description: 'Serve in dev mode'}),
  env: flags.option({ char: 'e', description: 'The environment to build for', default: 'local', options: ['local', 'testing', 'development', 'staging', 'production'] }),
  exit: flags.boolean({char: 'e', description: 'Exit after cache', default: false }),
  minify: flags.boolean({char: 'm', description: 'Minify generated files'}),
  port: flags.string({ char: 'p', description: 'Port to serve on', default: '3000' }),
};

module.exports = ServeCommand;

const { Command, flags } = require('@oclif/command')
const { exec } = require('child_process')
const Build = require('./build')
const Cache = require('./cache')
const chokidar = require('chokidar')

class ServeCommand extends Command {
  async run() {
    const { flags } = this.parse(ServeCommand);

    if (isNaN(flags.port)) {
      return this.error('Port must be a number');
    }

    process.env.FORMIDABLE_PORT = flags.port;

    if (flags.dev) {
      await Build.run(['--env', flags.env, '--continue']);

      const watcher = chokidar.watch('./**/*.imba', {
        ignored: ['.formidable', 'node_modules', 'public', 'dist', 'test', 'tests'],
        persistent: true,
        ignoreInitial: true
      });

      watcher.on('all', async () => await Build.run(['--env', flags.env, '--continue']));

      process.on('SIGINT', () => {
        watcher.close();
        process.exit();
      });
    }

    if (!flags.dev) {
      await Cache.run(['--env', flags.env, '--continue']);
    }

    const watch = flags.dev ? '-w' : '';

    const command = `node node_modules/.bin/imba ${watch} server.imba`;

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
  dev : flags.boolean({char: 'd', description: 'Serve in dev mode (build, serve and watch)'}),
  env: flags.option({ char: 'e', description: 'The environment to build for', default: 'local', options: ['local', 'testing', 'development', 'staging', 'production'] }),
  exit: flags.boolean({char: 'e', description: 'Exit after cache', default: false }),
  minify: flags.boolean({char: 'm', description: 'Minify generated files'}),
  port: flags.string({ char: 'p', description: 'Port to serve on', default: '3000' }),
  debug: flags.boolean({char: 'D', description: 'Enable debugging'}),
};

module.exports = ServeCommand;

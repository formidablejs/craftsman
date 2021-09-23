const { Command, flags } = require('@oclif/command');
const { exec } = require('child_process');
const Cache = require('./cache');

class BuildCommand extends Command {

  async run() {
    const { flags } = this.parse(BuildCommand)

    const outdir = flags.outdir ?? '.formidable'
    const minify = flags.minify ? '--minify' : ''
    const _minify = flags['no-minify'] ? '--no-minify' : ''
    const _sourceMap = flags['no-sourcemap'] ? '-S' : ''
    const _hashing = flags['no-hashing'] ? '-H' : ''

    await Cache.run(['--env', flags.env]);

    const command = `node node_modules/.bin/imba build server.app.imba ${_minify} ${minify} ${_sourceMap} ${_hashing} --outdir=${outdir} --clean`

    const imba = exec(command)

    imba.stdout.on('data', (data) => {
      if (flags.silent) return;

      console.log(data.trim());
    });

    imba.stderr.on('data', (data) => {
      if (flags.silent) return;

      console.error(data.trim());
    });
  }
}

BuildCommand.description = `Build Formidable application`

BuildCommand.flags = {
  env: flags.option({ char: 'e', description: 'The environment to build for', default: 'local', options: ['local', 'testing', 'development', 'staging', 'production'] }),
  outdir: flags.string({char: 'o', description: 'Directort to output files', default: '.formidable'}),
  minify: flags.boolean({char: 'm', description: 'Minify generated files'}),
  'no-minify': flags.boolean({char: 'M', description: 'Disable minifying'}),
  'no-sourcemap': flags.boolean({char: 'S', description: 'Disable sourcemaps', default: true }),
  'no-hashing': flags.boolean({char: 'H', description: 'Disable hashing' }),
  'silent': flags.boolean({char: 's', description: 'Disable output'}),
}

module.exports = BuildCommand

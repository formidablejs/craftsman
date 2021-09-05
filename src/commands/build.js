const { Command, flags } = require('@oclif/command');
const { exec } = require('child_process');

class BuildCommand extends Command {
  async run() {
    const { flags } = this.parse(BuildCommand)

    const outdir = flags.outdir ?? 'dist'
    const minify = flags.minify ? '--minify' : ''
    const _minify = flags['no-minify'] ? '--no-minify' : ''
    const _sourceMap = flags['no-sourcemap'] ? '-S' : ''
    const _hashing = flags['no-hashing'] ? '-H' : ''

    let command = `node node_modules/.bin/imba build server.imba ${_minify} ${minify} ${_hashing} --outdir=${outdir} --clean`

    if (flags.test) {
      command = `node node_modules/.bin/imba build server.cli.imba ${_minify} ${minify} ${_sourceMap} ${_hashing} --outdir=bootstrap/compiled --clean`
    }

    const imba = exec(command)

    imba.stdout.on('data', (data) => {
      console.log(data.trim());
    });

    imba.stderr.on('data', (data) => {
      console.error(data.trim());
    });
  }
}

BuildCommand.description = `Build Formidable application`

BuildCommand.flags = {
  test: flags.boolean({char: 't', description: 'Compile a test build'}),
  outdir: flags.string({char: 'o', description: 'Directort to output files'}),
  minify: flags.boolean({char: 'm', description: 'Minify generated files'}),
  'no-minify': flags.boolean({char: 'M', description: 'Disable minifying'}),
  'no-sourcemap': flags.boolean({char: 'S', description: 'Disable sourcemaps', default: true }),
  'no-hashing': flags.boolean({char: 'H', description: 'Disable hashing' }),
}

module.exports = BuildCommand

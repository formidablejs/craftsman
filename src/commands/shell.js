// Experimental. Needs a refactor

const { Command, flags } = require('@oclif/command');
const { ImbaRepl, ImbaCompiler } = require('imba-shell');
const { REPLServer } = require('repl');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

class ShellCommand extends Command {
	async run() {
		const { flags } = this.parse(ShellCommand);

    const server = path.join(process.cwd(), '.formidable', 'server.app.js')

    if (!fs.existsSync(server)) {
      return this.error(chalk.red('Build missing. Run "craftsman build" to fix the problem.'));
    }

    const Formidable = require(server);

    const app = await Formidable.Application;

    const repl = new ImbaRepl;

    repl.registerCallback((ctx) => {
      const context = app.context.registered;

      Object.keys(context).forEach((key) => {
        if (!ctx[key]) {
          ctx[key] = context[key];
        }
      });
    })

    /** @type {REPLServer} */
    const replServer = await repl.run();

    replServer.on('exit', () => {
      process.exit();
    });
	}
}

const isRecoverableError = (error) => {
  if (error.name === 'SyntaxError') {
    return /^(Unexpected end of input|Unexpected token)/.test(error.message);
  }

  return false;
}

const handle = async (cmd, context, file, cb) => {
  const code = ImbaCompiler.code(cmd, String(new Date().valueOf())).get();

  try {
    let results = await vm.runInNewContext(code, context)

    cb(null, results);
  } catch (error) {
    if (isRecoverableError(error)) {
      cb(new repl.Recoverable(error));
    } else {
      console.log(error);
    }
  }
}

ShellCommand.description = `Cache application config`

ShellCommand.flags = {
	debug: flags.boolean({ char: 'd', description: 'Run in debug mode - show errors if cache fails' }),
	env: flags.option({ char: 'e', description: 'The environment to build for', default: 'local', options: ['local', 'testing', 'development', 'staging', 'production'] }),
	continue: flags.boolean({ char: 'x', description: 'Continue running after cache', default: false })
}

module.exports = ShellCommand

const fs = require('fs');
const path = require('path');
const { Command, flags } = require('@oclif/command');
const { default: chalk } = require('chalk');

const stubs = path.join(process.cwd(), 'node_modules', '@formidablejs', 'stubs', 'src', 'stubs')

const makeShift = {
  stubs: {},
  options: [],
};

if (fs.existsSync(stubs)) {
  fs.readdirSync(stubs).filter((folder) => {
    const directory = path.join(stubs, folder);
    const stub = path.join(directory, 'stub');
    const resolver = path.join(directory, folder + '.js');

    if (
      fs.statSync(directory).isDirectory
      && fs.existsSync(resolver)
      && fs.existsSync(stub)
    ) {
      Object.assign(makeShift.stubs, { [folder]: require(resolver) });
      makeShift.options.push(folder);
    }
  });
}

class MakeCommand extends Command {
  static args = [
    {
      name: 'resource',
      required: true,
      description: 'Resource type',
      options: makeShift.options
    },
    {
      name: 'name',
      required: true,
      description: 'Resource name'
    },
  ]

  async run() {
    const { args, flags } = this.parse(MakeCommand);
    let options = {};

    if (flags.options) {
      options = flags.options.split(',');
      let build = {};

      Object.keys(options).forEach((opt) => {
        let [key, value] = options[opt].split(':');

        build = Object.assign(build, {
          [key]: isNaN(value) ? value : Number(value)
        });
      });

      options = build;
    }

    const stub = new makeShift.stubs[args.resource](args.name, options, args.resource);

    const information = stub.make();

    const filePath = path.join(process.cwd(), information.destination, stub.namespace, information.fileName);

    if (fs.existsSync(filePath)) return this.error(`${args.resource} already exists.`);

    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(path.normalize(filePath), information.output);

    if (fs.existsSync(filePath)) {
      return this.log(chalk.green(`${args.resource} created successfully.`));
    }

    throw new Error(`${args.resource} not created.`);
  }
}

MakeCommand.description = `Make resource`
MakeCommand.flags = {
  options: flags.string({ char: 'o', description: 'Resource options' })
};

module.exports = MakeCommand
